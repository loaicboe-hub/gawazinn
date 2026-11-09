import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import type {
  HomeCareDirectoryPayload,
  HomeFileOverviewPayload,
  MyGawazInnHubPayload,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-stage11-married-life-home-file-secret';

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
  const firstSeed = seedDatabase(db, TEST_SECRET);
  expect(firstSeed.stage11Seeded).toBe(true);
  const secondSeed = seedDatabase(db, TEST_SECRET);
  expect(secondSeed.stage11Seeded).toBe(false);

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

describe('Stage 11 Married Life, Home Care Directory & Digital Home File API', () => {
  it('enforces SEO sitemap visibility, public directory grounding, strict owner isolation, cycle advancement & inventory valuation', async () => {
    // 1. Sitemap includes public Stage 11 routes and excludes private /my/home-file
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/newlyweds-guide</loc>');
    expect(xml).toContain('/home-care</loc>');
    expect(xml).not.toContain('/my/home-file</loc>');

    // 2. Public Directory Endpoint
    const dirRes = await reqJson<HomeCareDirectoryPayload>('/api/v1/home-care/directory');
    expect(dirRes.status).toBe(200);
    const dirData = dirRes.body.data!;
    expect(dirData.tracks).toHaveLength(6);
    expect(dirData.categories.map((c) => c.slug).sort()).toEqual([
      'home_maintenance',
      'moving_logistics',
    ]);
    expect(dirData.vendors.length).toBeGreaterThanOrEqual(2);
    expect(dirData.articles.some((a) => a.domain === 'married_life')).toBe(true);

    // 3. Unauthenticated caller gets 401 on private home-file endpoints
    const anonOv = await reqJson('/api/v1/home-care/overview');
    expect(anonOv.status).toBe(401);

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

    // 4. Karim sees seeded home assets, 1 overdue + 1 due_soon reminders, and 113,200 EGP inventory
    const karimOvRes = await reqJson<HomeFileOverviewPayload>('/api/v1/home-care/overview', {
      cookie: karimCookie,
    });
    expect(karimOvRes.status).toBe(200);
    const kOv = karimOvRes.body.data!;
    expect(kOv.assets).toHaveLength(4);
    expect(kOv.reminders).toHaveLength(4);
    expect(kOv.summary.overdueReminders).toBe(1);
    expect(kOv.summary.dueSoonReminders).toBe(1);
    expect(kOv.summary.totalInventoryValueEgp).toBe(36900 + 24500 + 29800 + 22000);
    expect(kOv.warranties.length).toBeGreaterThanOrEqual(1);
    expect(kOv.documents.length).toBeGreaterThanOrEqual(1);

    // 5. Sara sees zero Karim items and receives 403 on cross-owner asset/reminder/inventory mutation
    const saraOvRes = await reqJson<HomeFileOverviewPayload>('/api/v1/home-care/overview', {
      cookie: saraCookie,
    });
    expect(saraOvRes.status).toBe(200);
    expect(saraOvRes.body.data!.assets).toHaveLength(0);

    const saraDeleteAsset = await reqJson('/api/v1/home-care/assets/hfa-karim-1', {
      method: 'DELETE',
      cookie: saraCookie,
    });
    expect(saraDeleteAsset.status).toBe(403);

    const saraCompleteRem = await reqJson('/api/v1/home-care/reminders/mrem-karim-1/complete', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({}),
    });
    expect(saraCompleteRem.status).toBe(403);

    const saraPatchInv = await reqJson('/api/v1/home-care/inventory/hinv-karim-1', {
      method: 'PATCH',
      cookie: saraCookie,
      body: JSON.stringify({ condition: 'needs_service' }),
    });
    expect(saraPatchInv.status).toBe(403);

    // 6. Karim completes overdue reminder mrem-karim-1 -> status advances to 'upcoming', overdue drops to 0, notification issued
    const completeRes = await reqJson<HomeFileOverviewPayload>(
      '/api/v1/home-care/reminders/mrem-karim-1/complete',
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({ notes: 'تم الغسيل والتشيك بنجاح' }),
      },
    );
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data!.summary.overdueReminders).toBe(0);
    const updatedRem = completeRes.body.data!.reminders.find((r) => r.id === 'mrem-karim-1')!;
    expect(updatedRem.status).toBe('upcoming');

    const hubRes = await reqJson<MyGawazInnHubPayload>('/api/v1/my/hub', {
      cookie: karimCookie,
    });
    expect(hubRes.status).toBe(200);
    expect(
      hubRes.body.data!.notifications.some((n) => n.linkPath === '/my/home-file?tab=maintenance'),
    ).toBe(true);

    // 7. Karim creates a paint asset & inventory item & updates condition
    const createAssetRes = await reqJson<HomeFileOverviewPayload>('/api/v1/home-care/assets', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        roomLabel: 'غرفة الأطفال',
        assetCategory: 'paint_code',
        titleAr: 'درجة أوف وايت هادئ',
        codeOrSerial: 'Jotun 1622',
      }),
    });
    expect(createAssetRes.status).toBe(201);
    expect(createAssetRes.body.data!.summary.totalAssets).toBe(5);

    const createInvRes = await reqJson<HomeFileOverviewPayload>('/api/v1/home-care/inventory', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        roomLabel: 'المطبخ',
        itemName: 'ميكروويف شارب 34 لتر',
        brandModel: 'Sharp R-750MR',
        purchasePriceEgp: 9200,
        condition: 'new',
      }),
    });
    expect(createInvRes.status).toBe(201);
    expect(createInvRes.body.data!.summary.totalInventoryValueEgp).toBe(113200 + 9200);
  });
});

