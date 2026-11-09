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

const TEST_SECRET = 'vitest-stage3-calculators-budget-secret';

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
  // Confirm Stage 3 seeding is strictly idempotent
  const secondSeed = seedDatabase(db, TEST_SECRET);
  expect(secondSeed.stage3Seeded).toBe(false);

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

describe('Stage 3 Calculators Engine & Wedding Budget Manager APIs', () => {
  it('exposes all 20 calculators publicly, allows guest calculation without persistence, and lists routes in sitemap.xml', async () => {
    const calcsRes = await reqJson<{ slug: string }[]>('/api/v1/calculators');
    expect(calcsRes.status).toBe(200);
    expect(calcsRes.body.data?.length).toBe(20);

    // Guest compute returns result without persisting runId
    const guestRun = await reqJson<{ runId: string | null; output: { primaryMetric: { value: number } } }>(
      '/api/v1/calculators/finishing-cost/calculate',
      {
        method: 'POST',
        body: JSON.stringify({
          inputs: { areaSqm: 150, tier: 'luxury', governorate: 'cairo', bathroomsCount: 2, includeKitchenPrep: true },
          saveRun: true,
        }),
      },
    );
    expect(guestRun.status).toBe(200);
    expect(guestRun.body.data?.runId).toBeNull();
    expect(guestRun.body.data?.output.primaryMetric.value).toBeGreaterThan(700000);

    // Unknown calculator returns 404
    const notFoundRun = await reqJson('/api/v1/calculators/does-not-exist/calculate', {
      method: 'POST',
      body: JSON.stringify({ inputs: {} }),
    });
    expect(notFoundRun.status).toBe(404);

    // Sitemap exposes /calculators and all 20 slugs
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/calculators</loc>');
    expect(xml).toContain('/calculators/finishing-cost');
    expect(xml).toContain('/calculators/long-term-projections');
    expect(xml).toContain('/calculators/emergency-reserve');
  });

  it('rejects unauthenticated access to /my/calculator-runs and /budget/*, and strictly isolates Karim vs Sara', async () => {
    expect((await reqJson('/api/v1/my/calculator-runs')).status).toBe(401);
    expect((await reqJson('/api/v1/budget/overview')).status).toBe(401);
    expect(
      (
        await reqJson('/api/v1/budget/import-from-calculator', {
          method: 'POST',
          body: JSON.stringify({ calculatorSlug: 'finishing-cost', inputs: { areaSqm: 120 } }),
        })
      ).status,
    ).toBe(401);

    const karimRes = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimRes.setCookie);

    const saraRes = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const saraCookie = extractSessionCookie(saraRes.setCookie);

    // Karim saves a calculator run
    const savedCalc = await reqJson<{ runId: string | null }>('/api/v1/calculators/gold-jewelry/calculate', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        inputs: { goldWeightGrams: 50, karat: '21k', workmanshipPerGramEgp: 280 },
        saveRun: true,
        savedTitle: 'شبكة 50 جرام عيار 21',
      }),
    });
    expect(savedCalc.status).toBe(200);
    expect(savedCalc.body.data?.runId).toBeTruthy();

    const karimRuns = await reqJson<{ id: string }[]>('/api/v1/my/calculator-runs', { cookie: karimCookie });
    const saraRuns = await reqJson<{ id: string }[]>('/api/v1/my/calculator-runs', { cookie: saraCookie });
    expect(karimRuns.body.data?.some((r) => r.id === savedCalc.body.data?.runId)).toBe(true);
    expect(saraRuns.body.data?.some((r) => r.id === savedCalc.body.data?.runId)).toBe(false);

    // Sara cannot delete Karim's saved calculation run
    const crossDelete = await reqJson(`/api/v1/my/calculator-runs/${savedCalc.body.data?.runId}`, {
      method: 'DELETE',
      cookie: saraCookie,
    });
    expect(crossDelete.status).toBe(404);
  });

  it('imports calculator results idempotently, syncs customer orders/bookings without duplication, and triggers overrun alerts', async () => {
    const karimRes = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimRes.setCookie);

    // 1. Import from calculator with explicit runId twice -> zero duplicate budget_expenses
    const firstImport = await reqJson<{
      runId: string;
      overview: { expenses: { id: string; sourceType: string; sourceId: string | null; amount: number }[] };
    }>('/api/v1/budget/import-from-calculator', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        calculatorSlug: 'kitchen-setup',
        inputs: { runLengthMeters: 5, kitchenMaterial: 'hpl', appliancesTier: 'balanced', includeMarble: true },
        categorySlug: 'finishing',
        mode: 'add_planned_expense',
        paidBySide: 'shared',
        title: 'تجهيز المطبخ 5 متر',
      }),
    });
    expect(firstImport.status).toBe(200);
    const runId = firstImport.body.data!.runId;
    const countAfterFirst = firstImport.body.data!.overview.expenses.filter((e) => e.sourceId === runId).length;
    expect(countAfterFirst).toBe(1);

    const secondImport = await reqJson<{
      runId: string;
      overview: { expenses: { id: string; sourceId: string | null }[] };
    }>('/api/v1/budget/import-from-calculator', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        runId,
        calculatorSlug: 'kitchen-setup',
        inputs: { runLengthMeters: 6, kitchenMaterial: 'acrylic', appliancesTier: 'premium', includeMarble: true },
        categorySlug: 'finishing',
        mode: 'add_planned_expense',
        paidBySide: 'shared',
        title: 'تجهيز المطبخ 6 متر محدث',
      }),
    });
    expect(secondImport.status).toBe(200);
    expect(secondImport.body.data!.overview.expenses.filter((e) => e.sourceId === runId).length).toBe(1);

    // 2. Sync platform orders & wedding bookings idempotently
    const sync1 = await reqJson<{
      syncedCount: number;
      overview: { expenses: { sourceType: string }[] };
    }>('/api/v1/budget/sync-transactions', {
      method: 'POST',
      cookie: karimCookie,
    });
    expect(sync1.status).toBe(200);
    const expLenAfterSync1 = sync1.body.data!.overview.expenses.length;

    const sync2 = await reqJson<{
      syncedCount: number;
      overview: { expenses: { sourceType: string }[] };
    }>('/api/v1/budget/sync-transactions', {
      method: 'POST',
      cookie: karimCookie,
    });
    expect(sync2.status).toBe(200);
    expect(sync2.body.data!.syncedCount).toBe(0);
    expect(sync2.body.data!.overview.expenses.length).toBe(expLenAfterSync1);

    // 3. Log large expense in 'gold_shabka' category -> triggers over_limit critical alert -> mark paid -> delete
    const createExp = await reqJson<{
      expenses: { id: string; status: string; title: string }[];
      alerts: { type: string; categorySlug?: string }[];
      summary: { totalPaid: number };
    }>('/api/v1/budget/expenses', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        categorySlug: 'gold_shabka',
        title: 'شراء طقم الشبكة الرئيسي',
        amount: 260000,
        paymentType: 'full',
        status: 'upcoming',
        paidBySide: 'groom',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      }),
    });
    expect(createExp.status).toBe(201);
    expect(
      createExp.body.data!.alerts.some((a) => a.type === 'over_limit' && a.categorySlug === 'gold_shabka'),
    ).toBe(true);
    expect(createExp.body.data!.alerts.some((a) => a.type === 'upcoming_payment')).toBe(true);

    const newExp = createExp.body.data!.expenses.find((e) => e.title === 'شراء طقم الشبكة الرئيسي')!;
    const beforePaid = createExp.body.data!.summary.totalPaid;

    const markPaid = await reqJson<{
      summary: { totalPaid: number };
      expenses: { id: string; status: string }[];
    }>(`/api/v1/budget/expenses/${newExp.id}`, {
      method: 'PATCH',
      cookie: karimCookie,
      body: JSON.stringify({ status: 'paid' }),
    });
    expect(markPaid.status).toBe(200);
    expect(markPaid.body.data!.summary.totalPaid).toBe(beforePaid + 260000);

    const delExp = await reqJson<{ expenses: { id: string }[] }>(`/api/v1/budget/expenses/${newExp.id}`, {
      method: 'DELETE',
      cookie: karimCookie,
    });
    expect(delExp.status).toBe(200);
    expect(delExp.body.data!.expenses.some((e) => e.id === newExp.id)).toBe(false);
  });
});
