import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import { runCalculator } from '../../shared/calculators';
import type {
  AiAssistantReplyPayload,
  AiConversationSummary,
  MyGawazInnHubPayload,
  PublicRsvpPayload,
  RoomMoodboard,
  WeddingDayOverviewPayload,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-stage10-ai-room-wedding-secret';

async function reqJson<T = unknown>(
  path: string,
  options: RequestInit & { cookie?: string } = {},
): Promise<{
  status: number;
  body: { ok: boolean; data?: T; error?: { code: string; message: string } };
  setCookie?: string;
}> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.cookie) {
    headers.Cookie = options.cookie;
  }

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await res.text();
  let parsed: { ok: boolean; data?: T; error?: { code: string; message: string } };
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { ok: res.ok };
  }
  const setCookie = res.headers.get('set-cookie') || undefined;
  return { status: res.status, body: parsed, setCookie };
}

function extractSessionCookie(setCookieHeader?: string): string {
  if (!setCookieHeader) return '';
  const match = setCookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? `${SESSION_COOKIE_NAME}=${match[1]}` : '';
}

beforeAll(async () => {
  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  runMigrations(db);
  seedDatabase(db, TEST_SECRET);
  const secondSeed = seedDatabase(db, TEST_SECRET);
  expect(secondSeed.stage10Seeded).toBe(false);

  const handler = createAppHandler(db, {
    sessionSecret: TEST_SECRET,
    appOrigin: 'http://localhost:3000',
    sessionTtlSeconds: 3600,
    isProduction: false,
  });

  server = http.createServer((req, res) => {
    void handler(req, res);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr !== 'string') baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  db.close();
});

describe('Stage 10 Grounded AI, Room Studio, Wedding Day Ops & Public RSVP API', () => {
  it('enforces grounded DB citations, owner privacy boundaries, catalog price pinning, table capacity limits, and atomic public gift reservation', async () => {
    // 1. SEO Sitemap includes public AI & Room Studio tools, excludes private Wedding Ops & RSVP links
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/assistant</loc>');
    expect(xml).toContain('/room-designer</loc>');
    expect(xml).not.toContain('/wedding-day</loc>');
    expect(xml).not.toContain('/rsvp/</loc>');

    // 2. Guest asks Grounded AI about 120m finishing cost + catalog appliance
    const guestAiRes = await reqJson<AiAssistantReplyPayload>('/api/v1/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({
        query: 'احسب لي تكلفة تشطيب شقة 120 متر باقة متوسطة مع ترشيح ثلاجة تحت 38000',
        language: 'ar',
      }),
    });
    expect(guestAiRes.status).toBe(200);
    const guestReply = guestAiRes.body.data!;
    expect(guestReply.usedPersonalContext).toBe(false);
    expect(guestReply.groundedFactsCount).toBeGreaterThan(0);

    // Deterministic formula match check
    const expectedFinish = runCalculator('finishing-cost', { areaSqm: 120, tier: 'medium' });
    const aiFinishCalc = guestReply.assistantMessage.calculations.find(
      (c) => c.calculatorSlug === 'finishing-cost',
    );
    expect(aiFinishCalc).toBeDefined();
    expect(aiFinishCalc!.primaryValue).toBe(expectedFinish.primaryMetric.value);
    expect(guestReply.assistantMessage.citations.some((c) => c.kind === 'product')).toBe(true);

    // Login Karim & Sara
    const loginAs = async (identifier: string, password: string) => {
      const r = await reqJson('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      expect(r.status).toBe(200);
      return extractSessionCookie(r.setCookie);
    };
    const karimCookie = await loginAs('karim@gawazinn.demo', 'DemoPass@2026');
    const saraCookie = await loginAs('sara@gawazinn.demo', 'DemoPass@2026');

    // 3. Authenticated Karim asks personal budget analysis -> persists conversation & private context ONLY for Karim
    const karimAiRes = await reqJson<AiAssistantReplyPayload>('/api/v1/assistant/ask', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        query: 'حلل لي ميزانية الزواج الحالية وحالة مدخرات البداية المبكرة الخاصة بي',
        language: 'ar',
      }),
    });
    expect(karimAiRes.status).toBe(200);
    expect(karimAiRes.body.data?.usedPersonalContext).toBe(true);
    const convId = karimAiRes.body.data!.conversationId;

    const karimHistory = await reqJson<AiConversationSummary[]>('/api/v1/assistant/history', {
      cookie: karimCookie,
    });
    expect(karimHistory.status).toBe(200);
    expect(karimHistory.body.data?.some((c) => c.id === convId)).toBe(true);

    // Sara MUST be blocked from hijacking Karim's conversationId (403)
    const saraHijack = await reqJson('/api/v1/assistant/ask', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        query: 'اختبار خصوصية المحادثة',
        conversationId: convId,
      }),
    });
    expect(saraHijack.status).toBe(403);

    // 4. 2D Room Designer: Catalog Price Pinning & Owner Isolation
    const karimBoardsInit = await reqJson<RoomMoodboard[]>('/api/v1/room-studio/moodboards', {
      cookie: karimCookie,
    });
    expect(karimBoardsInit.status).toBe(200);
    expect(karimBoardsInit.body.data?.some((b) => b.id === 'mb-karim-living')).toBe(true);

    const newBoardRes = await reqJson<RoomMoodboard>('/api/v1/room-studio/moodboards', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        titleAr: 'غرفة النوم الرئيسية — مودرن',
        roomType: 'bedroom',
        lengthM: 4.5,
        widthM: 4.0,
        themeSlug: 'warm_beige',
      }),
    });
    expect(newBoardRes.status).toBe(201);
    const createdBoard = newBoardRes.body.data!;
    expect(createdBoard.floorAreaSqm).toBe(18);

    // Try adding catalog product p1 with tampered price 1 EGP -> server pins REAL DB price from products table!
    const dbP1 = db.prepare('SELECT id, price FROM products LIMIT 1').get() as {
      id: string;
      price: number;
    };
    const addProdRes = await reqJson<RoomMoodboard>(
      `/api/v1/room-studio/moodboards/${createdBoard.id}/items`,
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          itemType: 'product',
          productId: dbP1.id,
          labelAr: 'تكييف أو منتج موثق',
          widthCm: 120,
          depthCm: 60,
          estimatedPriceEgp: 1,
        }),
      },
    );
    expect(addProdRes.status).toBe(201);
    const pinnedItem = addProdRes.body.data!.items[0];
    expect(pinnedItem.estimatedPriceEgp).toBe(dbP1.price);

    // Update position X/Y
    const patchItemRes = await reqJson<RoomMoodboard>(`/api/v1/room-studio/items/${pinnedItem.id}`, {
      method: 'PATCH',
      cookie: karimCookie,
      body: JSON.stringify({ posXPct: 72, posYPct: 35 }),
    });
    expect(patchItemRes.status).toBe(200);
    expect(patchItemRes.body.data!.items[0].posXPct).toBe(72);

    // Owner isolation: Sara cannot mutate Karim's board or delete Karim's item
    const saraAddItem = await reqJson(
      `/api/v1/room-studio/moodboards/${createdBoard.id}/items`,
      {
        method: 'POST',
        cookie: saraCookie,
        body: JSON.stringify({
          itemType: 'custom_furniture',
          labelAr: 'تعديل غير مصرح',
          widthCm: 100,
          depthCm: 80,
          estimatedPriceEgp: 5000,
        }),
      },
    );
    expect(saraAddItem.status).toBe(403);

    // 5. Wedding Day Ops: Seating Table Capacity Guard (409 TABLE_CAPACITY_EXCEEDED)
    const tightTableRes = await reqJson<WeddingDayOverviewPayload>('/api/v1/wedding-day/tables', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        tableName: 'طاولة اختبار السعة 2',
        zone: 'vip_front',
        capacity: 2,
      }),
    });
    expect(tightTableRes.status).toBe(201);
    const tightTableId = tightTableRes.body.data!.tables.find(
      (t) => t.tableName === 'طاولة اختبار السعة 2',
    )!.id;

    const threeGuestRes = await reqJson<WeddingDayOverviewPayload>('/api/v1/wedding-day/guests', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        fullName: 'عائلة د. محمود (3 مقاعد)',
        side: 'shared',
        guestGroup: 'family',
        invitedCount: 3,
      }),
    });
    expect(threeGuestRes.status).toBe(201);
    const threeGuestId = threeGuestRes.body.data!.guests.find(
      (g) => g.fullName === 'عائلة د. محمود (3 مقاعد)',
    )!.id;

    const overflowRes = await reqJson(`/api/v1/wedding-day/guests/${threeGuestId}`, {
      method: 'PATCH',
      cookie: karimCookie,
      body: JSON.stringify({ tableId: tightTableId }),
    });
    expect(overflowRes.status).toBe(409);
    expect(overflowRes.body.error?.code).toBe('TABLE_CAPACITY_EXCEEDED');

    // 6. Public RSVP GI-KARIM-102 + Atomic Gift Reservation (409 GIFT_ALREADY_RESERVED)
    const pubGet = await reqJson<PublicRsvpPayload>('/api/v1/rsvp/GI-KARIM-102');
    expect(pubGet.status).toBe(200);
    expect(pubGet.body.data?.guest.rsvpStatus).toBe('pending');
    expect(pubGet.body.data?.giftRegistry.some((g) => g.id === 'gift-karim-2')).toBe(true);

    const pubConfirm = await reqJson<PublicRsvpPayload>('/api/v1/rsvp/GI-KARIM-102', {
      method: 'POST',
      body: JSON.stringify({
        rsvpStatus: 'confirmed',
        attendingCount: 2,
        mealPreference: 'vegetarian',
        dietaryNotes: 'ألف مبروك لكريم ونهى!',
      }),
    });
    expect(pubConfirm.status).toBe(200);
    expect(pubConfirm.body.data?.guest.rsvpStatus).toBe('confirmed');
    expect(pubConfirm.body.data?.guest.attendingCount).toBe(2);

    const giftReserve1 = await reqJson<PublicRsvpPayload>('/api/v1/rsvp/GI-KARIM-102/reserve-gift', {
      method: 'POST',
      body: JSON.stringify({ giftId: 'gift-karim-2', guestName: 'يوسف حلمي' }),
    });
    expect(giftReserve1.status).toBe(200);
    expect(
      giftReserve1.body.data?.giftRegistry.find((g) => g.id === 'gift-karim-2')?.reservationStatus,
    ).toBe('reserved');

    // Double reservation on same gift MUST be blocked atomically!
    const giftReserve2 = await reqJson('/api/v1/rsvp/GI-KARIM-102/reserve-gift', {
      method: 'POST',
      body: JSON.stringify({ giftId: 'gift-karim-2', guestName: 'ضيف آخر' }),
    });
    expect(giftReserve2.status).toBe(409);
    expect(giftReserve2.body.error?.code).toBe('GIFT_ALREADY_RESERVED');

    // Verify Host (Karim) Wedding Overview & Notifications reflect both RSVP & Gift Reserve!
    const karimOps = await reqJson<WeddingDayOverviewPayload>('/api/v1/wedding-day/overview', {
      cookie: karimCookie,
    });
    expect(karimOps.status).toBe(200);
    const updatedGuest = karimOps.body.data?.guests.find((g) => g.rsvpCode === 'GI-KARIM-102');
    expect(updatedGuest?.rsvpStatus).toBe('confirmed');
    expect(updatedGuest?.attendingCount).toBe(2);

    const karimHub = await reqJson<MyGawazInnHubPayload>('/api/v1/my/hub', {
      cookie: karimCookie,
    });
    expect(
      karimHub.body.data?.notifications.some((n) => n.linkPath === '/wedding-day'),
    ).toBe(true);
  });
});
