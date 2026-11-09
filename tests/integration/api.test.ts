import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-secret-token-for-gawazinn-integration';

async function reqJson<T = unknown>(
  path: string,
  options: RequestInit & { cookie?: string; token?: string } = {},
): Promise<{ status: number; body: { ok: boolean; data?: T; error?: { code: string; message: string } }; setCookie?: string }> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.cookie) {
    headers.Cookie = options.cookie;
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
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
      if (addr && typeof addr !== 'string') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
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

describe('GAWAZ INN Core REST API & RBAC Integration', () => {
  it('returns healthy sqlite check and anonymous 200 bootstrap with 4 finishing packages & seeded CMS data', async () => {
    const health = await reqJson<{ status: string; sqlite: boolean }>('/api/v1/health');
    expect(health.status).toBe(200);
    expect(health.body.data?.sqlite).toBe(true);

    const bootstrap = await reqJson<{
      user: unknown;
      products: unknown[];
      finishingPackages: { id: string; pricePerMeter: number }[];
      articles: { slug: string }[];
      locations: { slug: string }[];
    }>('/api/v1/bootstrap');
    expect(bootstrap.status).toBe(200);
    expect(bootstrap.body.data?.user).toBeNull();
    expect(bootstrap.body.data?.finishingPackages.length).toBe(4);
    expect(bootstrap.body.data?.finishingPackages.some((p) => p.id === 'pack-medium')).toBe(true);
    expect(bootstrap.body.data?.articles.length).toBeGreaterThanOrEqual(8);
    expect(bootstrap.body.data?.locations.some((l) => l.slug === 'cairo')).toBe(true);
  });

  it('returns 401 on /auth/me when unauthenticated and emits valid dynamic XML sitemap', async () => {
    const me = await reqJson('/api/v1/auth/me');
    expect(me.status).toBe(401);

    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    expect(sitemapRes.status).toBe(200);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/guides/complete-egyptian-apartment-finishing-sequence');
    expect(xml).toContain('/locations/cairo');
  });

  it('registers a new customer, sets HttpOnly session cookie, and blocks duplicates', async () => {
    const reg = await reqJson<{ user: { id: string; email: string; role: string } }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'عمر حسن علي',
        email: 'omar.test@gawazinn.demo',
        phone: '+201055566677',
        password: 'OmarPassword@2026',
        city: 'Alexandria',
      }),
    });
    expect(reg.status).toBe(201);
    expect(reg.body.data?.user.role).toBe('customer');
    expect(reg.setCookie).toContain('HttpOnly');

    const cookie = extractSessionCookie(reg.setCookie);
    const me = await reqJson<{ email: string }>('/api/v1/auth/me', { cookie });
    expect(me.status).toBe(200);
    expect(me.body.data?.email).toBe('omar.test@gawazinn.demo');

    const dup = await reqJson('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'عمر مكرر',
        email: 'omar.test@gawazinn.demo',
        phone: '01099988877',
        password: 'OmarPassword@2026',
      }),
    });
    expect(dup.status).toBe(409);
  });

  it('rejects bad passwords and enforces strict per-user data isolation between Karim and Sara', async () => {
    const badLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'WrongPassword!' }),
    });
    expect(badLogin.status).toBe(401);

    const saraLogin = await reqJson<{ user: { id: string } }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    expect(saraLogin.status).toBe(200);
    const saraCookie = extractSessionCookie(saraLogin.setCookie);

    const saraOrders = await reqJson<{ id: string; userId: string }[]>('/api/v1/orders', { cookie: saraCookie });
    expect(saraOrders.status).toBe(200);
    expect(saraOrders.body.data?.every((o) => o.userId === saraLogin.body.data?.user.id)).toBe(true);

    const saraFinishing = await reqJson<{ id: string; userId: string }[]>('/api/v1/finishing-inquiries', {
      cookie: saraCookie,
    });
    expect(saraFinishing.status).toBe(200);
    expect(saraFinishing.body.data?.every((f) => f.userId === saraLogin.body.data?.user.id)).toBe(true);

    // Sara (customer) cannot access Admin OS overview -> 403 Forbidden
    const adminAttempt = await reqJson('/api/v1/admin/overview', { cookie: saraCookie });
    expect(adminAttempt.status).toBe(403);
  });

  it('masks 14-digit National IDs in financing & confidential support cases and isolates support visibility', async () => {
    const karimLogin = await reqJson<{ user: { id: string } }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    const finApp = await reqJson<{ nationalId: string }>('/api/v1/financing-applications', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        customerName: 'كريم شريف',
        phone: '01012345678',
        nationalId: '29805120104567',
        monthlyIncome: 25000,
        employer: 'شركة الهندسة المتطورة',
        governorate: 'Cairo',
        requestedAmount: 120000,
        tenureMonths: 24,
        preferredProvider: 'ValU (فاليو)',
        associatedSection: 'finishing',
      }),
    });
    expect(finApp.status).toBe(201);
    expect(finApp.body.data?.nationalId).toBe('298********567');

    // Karim cannot see seeded support cases belonging to usr-2
    const karimSupportList = await reqJson<{ id: string }[]>('/api/v1/support-cases', { cookie: karimCookie });
    expect(karimSupportList.status).toBe(200);
    expect(karimSupportList.body.data?.length).toBe(0);

    // Moderator CAN inspect support cases via Admin OS overview, but CANNOT update platform settings
    const modLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'mod@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const modCookie = extractSessionCookie(modLogin.setCookie);
    const modOverview = await reqJson<{ supportCases: unknown[]; orders: unknown[] }>('/api/v1/admin/overview', {
      cookie: modCookie,
    });
    expect(modOverview.status).toBe(200);
    expect(modOverview.body.data?.supportCases.length).toBeGreaterThanOrEqual(1);
    expect(modOverview.body.data?.orders.length).toBe(0);

    const modSettingsAttempt = await reqJson('/api/v1/admin/settings', {
      method: 'PATCH',
      cookie: modCookie,
      body: JSON.stringify({ hotline: '19999' }),
    });
    expect(modSettingsAttempt.status).toBe(403);
  });

  it('computes authoritative order totals server-side and decrements product stock', async () => {
    const karimLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    const productsRes = await reqJson<{ id: string; price: number; stock: number }[]>('/api/v1/products');
    const targetProduct = productsRes.body.data?.[0];
    expect(targetProduct).toBeDefined();

    // Even if client attempted passing extra spoofed fields, server ignores client prices and uses DB pricing
    const orderRes = await reqJson<{ id: string; subtotal: number; total: number }>('/api/v1/orders', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        customerName: 'كريم شريف',
        phone: '01012345678',
        address: '45 شارع الثورة — مصر الجديدة',
        city: 'Cairo',
        paymentMethod: 'cash_on_delivery',
        items: [{ productId: targetProduct!.id, quantity: 2 }],
        subtotal: 1,
        total: 1,
      }),
    });
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data?.total).toBe(targetProduct!.price * 2);

    const afterProducts = await reqJson<{ id: string; stock: number }[]>('/api/v1/products');
    const updatedProduct = afterProducts.body.data?.find((p) => p.id === targetProduct!.id);
    expect(updatedProduct?.stock).toBe(targetProduct!.stock - 2);
  });

  it('enforces admin-only catalog/wedding-service edits and records audit log entries', async () => {
    const adminLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@gawazinn.demo', password: 'AdminPass@2026' }),
    });
    expect(adminLogin.status).toBe(200);
    const adminCookie = extractSessionCookie(adminLogin.setCookie);

    const patchWed = await reqJson<{ startingPrice: number }>('/api/v1/admin/wedding-services/wed-v1', {
      method: 'PATCH',
      cookie: adminCookie,
      body: JSON.stringify({ startingPrice: 92000 }),
    });
    expect(patchWed.status).toBe(200);
    expect(patchWed.body.data?.startingPrice).toBe(92000);

    const adminOverview = await reqJson<{
      counts: { activeCustomers: number };
      auditLogs: { action: string }[];
    }>('/api/v1/admin/overview', { cookie: adminCookie });
    expect(adminOverview.status).toBe(200);
    expect(adminOverview.body.data?.counts.activeCustomers).toBeGreaterThanOrEqual(2);
    expect(
      adminOverview.body.data?.auditLogs.some((l) => l.action === 'admin.wedding_service_updated'),
    ).toBe(true);
  });
});
