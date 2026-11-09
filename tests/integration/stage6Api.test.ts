import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import type {
  CoupleWorkspacePayload,
  MyGawazInnHubPayload,
  PriceAlert,
  Product,
  ProductComparisonMatrixPayload,
  ProductEncyclopediaDetail,
  ShoppingList,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-stage6-products-shopping-secret';

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
  expect(secondSeed.stage6Seeded).toBe(false);

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

describe('Stage 6 Product Encyclopedia, Compare API, Multi-List Privacy & Price Alerts', () => {
  it('exposes /products & /products/compare + product slugs in sitemap while blocking private /my/shopping-lists', async () => {
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/products</loc>');
    expect(xml).toContain('/products/compare</loc>');
    expect(xml).toContain('/products/sharp-450l-inverter-fridge</loc>');
    expect(xml).not.toContain('/my/shopping-lists');

    expect((await reqJson('/api/v1/shopping-lists')).status).toBe(401);
    expect((await reqJson('/api/v1/price-alerts')).status).toBe(401);
  });

  it('filters & sorts products, resolves slug details with price history + merchant warnings, and compares up to 4 items', async () => {
    const allRes = await reqJson<Product[]>('/api/v1/products?trousseauType=groom&sortBy=price_asc');
    expect(allRes.status).toBe(200);
    const items = allRes.body.data || [];
    expect(items.length).toBeGreaterThanOrEqual(8);
    for (let i = 1; i < items.length; i += 1) {
      expect(items[i].price).toBeGreaterThanOrEqual(items[i - 1].price);
    }

    const detailRes = await reqJson<ProductEncyclopediaDetail>(
      '/api/v1/products/sharp-450l-inverter-fridge',
    );
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data?.product.id).toBe('groom-p1');
    expect(detailRes.body.data?.priceHistory.length).toBeGreaterThanOrEqual(3);
    expect(
      detailRes.body.data?.merchantOffers.some((o) => o.warrantyType === 'gray_market_importer'),
    ).toBe(true);
    expect(
      detailRes.body.data?.alternatives.some((a) => a.alternativeProductId === 'groom-p7'),
    ).toBe(true);

    const notFound = await reqJson('/api/v1/products/does-not-exist-999');
    expect(notFound.status).toBe(404);

    const compareRes = await reqJson<ProductComparisonMatrixPayload>(
      '/api/v1/products/compare?ids=groom-p1,groom-p7,groom-p8',
    );
    expect(compareRes.status).toBe(200);
    expect(compareRes.body.data?.products.length).toBe(3);
    expect(compareRes.body.data?.highlights.lowestPriceProductId).toBe('groom-p7');
  });

  it('enforces multi-list private vs partner-shared isolation & shoppingWrite RBAC in couple workspace', async () => {
    const karimLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    const saraLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const saraCookie = extractSessionCookie(saraLogin.setCookie);

    // Karim sees both his shared & private seeded shopping lists
    const karimListsRes = await reqJson<ShoppingList[]>('/api/v1/shopping-lists', {
      cookie: karimCookie,
    });
    expect(karimListsRes.status).toBe(200);
    expect(karimListsRes.body.data?.some((l) => l.id === 'sl-karim-appliances')).toBe(true);
    expect(karimListsRes.body.data?.some((l) => l.id === 'sl-karim-private-watch')).toBe(true);

    // Before joining Karim's workspace, Sara sees NEITHER list
    const saraBefore = await reqJson<ShoppingList[]>('/api/v1/shopping-lists', {
      cookie: saraCookie,
    });
    expect(saraBefore.status).toBe(200);
    expect(saraBefore.body.data?.some((l) => l.id === 'sl-karim-appliances')).toBe(false);

    // Karim invites Sara with shoppingRead=true, shoppingWrite=false
    const invRes = await reqJson<{ inviteToken: string; workspace: CoupleWorkspacePayload }>(
      '/api/v1/workspace/invite',
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          inviteeIdentifier: 'sara@gawazinn.demo',
          proposedRole: 'partner',
          proposedSide: 'bride',
          permissions: {
            budgetRead: true,
            budgetWrite: false,
            tasksRead: true,
            tasksWrite: false,
            shoppingRead: true,
            shoppingWrite: false,
            documentsRead: true,
            documentsWrite: false,
            approvePurchases: true,
          },
        }),
      },
    );
    expect(invRes.status).toBe(201);
    const token = invRes.body.data!.inviteToken;

    const acceptRes = await reqJson(
      `/api/v1/workspace/invitations/${encodeURIComponent(token)}/accept`,
      {
        method: 'POST',
        cookie: saraCookie,
      },
    );
    expect(acceptRes.status).toBe(200);

    // Now Sara sees Karim's SHARED list, but PRIVATE list stays strictly invisible
    const saraAfterAccept = await reqJson<ShoppingList[]>('/api/v1/shopping-lists', {
      cookie: saraCookie,
    });
    expect(saraAfterAccept.body.data?.some((l) => l.id === 'sl-karim-appliances')).toBe(true);
    expect(saraAfterAccept.body.data?.some((l) => l.id === 'sl-karim-private-watch')).toBe(false);

    // Attempting to access Karim's private list directly returns 404
    const privateAttempt = await reqJson('/api/v1/shopping-lists/sl-karim-private-watch', {
      method: 'PATCH',
      cookie: saraCookie,
      body: JSON.stringify({ notes: 'tamper' }),
    });
    expect(privateAttempt.status).toBe(404);

    // With shoppingWrite=false, adding an item to the shared list returns 403 FORBIDDEN
    const writeBlocked = await reqJson('/api/v1/shopping-lists/sl-karim-appliances/items', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({ customTitle: 'مكواة بخار', quantity: 1, targetUnitPrice: 2200 }),
    });
    expect(writeBlocked.status).toBe(403);

    // Grant shoppingWrite=true to Sara and confirm write succeeds
    const karimWs = await reqJson<CoupleWorkspacePayload>('/api/v1/workspace', { cookie: karimCookie });
    const saraMember = karimWs.body.data!.members.find((m) => m.userId === 'usr-2')!;
    const grantRes = await reqJson<CoupleWorkspacePayload>(
      `/api/v1/workspace/members/${saraMember.id}`,
      {
        method: 'PATCH',
        cookie: karimCookie,
        body: JSON.stringify({ ...saraMember.permissions, shoppingWrite: true }),
      },
    );
    expect(grantRes.status).toBe(200);

    const writeAllowed = await reqJson<{ itemId: string; lists: ShoppingList[] }>(
      '/api/v1/shopping-lists/sl-karim-appliances/items',
      {
        method: 'POST',
        cookie: saraCookie,
        body: JSON.stringify({
          productId: 'bride-p6',
          customTitle: 'قلاية هوائية للمطبخ',
          quantity: 1,
          targetUnitPrice: 8950,
          status: 'shortlisted',
        }),
      },
    );
    expect(writeAllowed.status).toBe(201);
    const createdItemId = writeAllowed.body.data!.itemId;

    // Karim marks item purchased and cleans up
    const patchItem = await reqJson<ShoppingList[]>(
      `/api/v1/shopping-list-items/${createdItemId}`,
      {
        method: 'PATCH',
        cookie: karimCookie,
        body: JSON.stringify({ status: 'purchased' }),
      },
    );
    expect(patchItem.status).toBe(200);
    const updatedAppliancesList = patchItem.body.data?.find((l) => l.id === 'sl-karim-appliances');
    expect(updatedAppliancesList?.totalPurchasedCost).toBe(8950);

    const delItem = await reqJson(`/api/v1/shopping-list-items/${createdItemId}`, {
      method: 'DELETE',
      cookie: karimCookie,
    });
    expect(delItem.status).toBe(200);
  });

  it('triggers user price alerts & writes unread notification when admin lowers catalog price', async () => {
    const karimLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    const adminLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@gawazinn.demo', password: 'AdminPass@2026' }),
    });
    const adminCookie = extractSessionCookie(adminLogin.setCookie);

    // Karim sets price alert on groom-p1 for <= 34,000 EGP (currently 36,500)
    const alertRes = await reqJson<{ alert: PriceAlert; alerts: PriceAlert[] }>('/api/v1/price-alerts', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({ productId: 'groom-p1', targetPrice: 34000 }),
    });
    expect(alertRes.status).toBe(201);
    expect(alertRes.body.data?.alert.status).toBe('active');

    // Admin updates groom-p1 price to 33,200 EGP
    const adminPatch = await reqJson<Product>('/api/v1/admin/products/groom-p1', {
      method: 'PATCH',
      cookie: adminCookie,
      body: JSON.stringify({ price: 33200 }),
    });
    expect(adminPatch.status).toBe(200);
    expect(adminPatch.body.data?.price).toBe(33200);

    // Verify alert transitioned to triggered & notification created
    const alertsAfter = await reqJson<PriceAlert[]>('/api/v1/price-alerts', {
      cookie: karimCookie,
    });
    const updatedAlert = alertsAfter.body.data?.find((a) => a.productId === 'groom-p1');
    expect(updatedAlert?.status).toBe('triggered');

    const hubAfter = await reqJson<MyGawazInnHubPayload>('/api/v1/my/hub', {
      cookie: karimCookie,
    });
    expect(
      hubAfter.body.data?.notifications.some(
        (n) => n.notifType === 'budget_alert' && n.linkPath?.includes('sharp-450l-inverter-fridge'),
      ),
    ).toBe(true);
  });
});
