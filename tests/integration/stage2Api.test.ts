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

const TEST_SECRET = 'vitest-stage2-encyclopedia-secret-key';

async function reqJson<T = unknown>(
  path: string,
  options: RequestInit & { cookie?: string } = {},
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
  // Second seed call verifies idempotency without duplicating Stage 1 or Stage 2 rows
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

describe('GAWAZ INN Stage 2 Encyclopedia Endpoints & Owner-Scoped Planner APIs', () => {
  it('verifies idempotent seeding and serves complete public encyclopedia bundle', async () => {
    const bundle = await reqJson<{
      finishingCategories: unknown[];
      finishingMaterials: unknown[];
      beforeAfterProjects: unknown[];
      contractors: { reviewsCount: number; isSampleListing: boolean }[];
      groomSubcategories: unknown[];
      groomConfigurablePackages: unknown[];
      brideCategories: unknown[];
      brideChecklistTemplates: unknown[];
      glossaryTerms: unknown[];
      faqItems: unknown[];
    }>('/api/v1/encyclopedia/bundle');

    expect(bundle.status).toBe(200);
    expect(bundle.body.data?.finishingCategories.length).toBe(22);
    expect(bundle.body.data?.finishingMaterials.length).toBe(10);
    expect(bundle.body.data?.beforeAfterProjects.length).toBe(4);
    expect(bundle.body.data?.contractors.length).toBe(6);
    expect(
      bundle.body.data?.contractors.every((c) => c.reviewsCount === 0 && c.isSampleListing === true),
    ).toBe(true);
    expect(bundle.body.data?.groomSubcategories.length).toBe(26);
    expect(bundle.body.data?.groomConfigurablePackages.length).toBe(4);
    expect(bundle.body.data?.brideCategories.length).toBe(19);
    expect(bundle.body.data?.brideChecklistTemplates.length).toBe(24);
    expect(bundle.body.data?.glossaryTerms.length).toBe(28);
    expect(bundle.body.data?.faqItems.length).toBe(12);

    const cmsCats = await reqJson<unknown[]>('/api/v1/categories');
    expect(cmsCats.status).toBe(200);
    expect(cmsCats.body.data?.length).toBe(13);

    const articlesRes = await reqJson<unknown[]>('/api/v1/articles');
    expect(articlesRes.status).toBe(200);
    expect(articlesRes.body.data?.length).toBe(12);
  });

  it('filters Stage 2 finishing, contractor, glossary, and FAQ endpoints cleanly and lists Stage 2 routes in sitemap.xml', async () => {
    const roughIn = await reqJson<{ phaseKey: string }[]>('/api/v1/finishing/categories?phase=rough_in');
    expect(roughIn.status).toBe(200);
    expect(roughIn.body.data?.length).toBeGreaterThanOrEqual(4);
    expect(roughIn.body.data?.every((c) => c.phaseKey === 'rough_in')).toBe(true);

    const plumbingMats = await reqJson<{ materialGroup: string }[]>(
      '/api/v1/finishing/materials?group=plumbing',
    );
    expect(plumbingMats.status).toBe(200);
    expect(plumbingMats.body.data?.length).toBeGreaterThanOrEqual(1);
    expect(plumbingMats.body.data?.every((m) => m.materialGroup === 'plumbing')).toBe(true);

    const alexProj = await reqJson<{ governorateSlug: string }[]>(
      '/api/v1/finishing/projects?governorate=alexandria',
    );
    expect(alexProj.status).toBe(200);
    expect(alexProj.body.data?.length).toBe(1);

    const mepContractors = await reqJson<{ specialtyGroup: string }[]>('/api/v1/contractors?specialty=mep');
    expect(mepContractors.status).toBe(200);
    expect(mepContractors.body.data?.length).toBeGreaterThanOrEqual(1);

    const glossarySearch = await reqJson<{ termAr: string }[]>(
      `/api/v1/glossary?q=${encodeURIComponent('الشرب')}`,
    );
    expect(glossarySearch.status).toBe(200);
    expect(glossarySearch.body.data?.some((t) => t.termAr.includes('الشرب'))).toBe(true);

    const finishingFaqs = await reqJson<{ domain: string }[]>('/api/v1/faqs?domain=finishing');
    expect(finishingFaqs.status).toBe(200);
    expect(finishingFaqs.body.data?.length).toBeGreaterThanOrEqual(1);

    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    expect(sitemapRes.status).toBe(200);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/finishing/encyclopedia');
    expect(xml).toContain('/finishing/materials');
    expect(xml).toContain('/finishing/contractors');
    expect(xml).toContain('/groom/encyclopedia');
    expect(xml).toContain('/bride/encyclopedia');
    expect(xml).toContain('/glossary');
    expect(xml).toContain('/faqs');
  });

  it('enforces authentication, Zod validation, owner isolation, and audit logs on /my/groom-plan and /my/bride-plan', async () => {
    // 1. Anonymous rejected with 401
    expect((await reqJson('/api/v1/my/groom-plan')).status).toBe(401);
    expect(
      (
        await reqJson('/api/v1/my/groom-plan', {
          method: 'PUT',
          body: JSON.stringify({ selectedTierKey: 'tier_200k', targetBudgetEgp: 200000 }),
        })
      ).status,
    ).toBe(401);
    expect((await reqJson('/api/v1/my/bride-plan')).status).toBe(401);

    // Login Karim (usr-1) & Sara (usr-2)
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

    // 2. Invalid Zod payload returns 400
    const badPut = await reqJson('/api/v1/my/groom-plan', {
      method: 'PUT',
      cookie: karimCookie,
      body: JSON.stringify({ selectedTierKey: 'tier_invalid', targetBudgetEgp: -50 }),
    });
    expect(badPut.status).toBe(400);

    // 3. Karim updates groom plan and verifies persistence without affecting Sara
    const karimPutGroom = await reqJson<{
      selectedTierKey: string;
      targetBudgetEgp: number;
      slotSelections: Record<string, string>;
      excludedSlots: string[];
      customItems: string[];
    }>('/api/v1/my/groom-plan', {
      method: 'PUT',
      cookie: karimCookie,
      body: JSON.stringify({
        selectedTierKey: 'tier_300k',
        targetBudgetEgp: 300000,
        slotSelections: { fridge: 'opt-fr-pre' },
        excludedSlots: ['ac'],
        customItems: ['ديب فريزر رأسى 6 درج'],
      }),
    });
    expect(karimPutGroom.status).toBe(200);
    expect(karimPutGroom.body.data?.selectedTierKey).toBe('tier_300k');
    expect(karimPutGroom.body.data?.slotSelections.fridge).toBe('opt-fr-pre');

    const karimGetGroom = await reqJson<{ selectedTierKey: string; customItems: string[] }>(
      '/api/v1/my/groom-plan',
      { cookie: karimCookie },
    );
    expect(karimGetGroom.body.data?.selectedTierKey).toBe('tier_300k');
    expect(karimGetGroom.body.data?.customItems).toContain('ديب فريزر رأسى 6 درج');

    const saraGetGroom = await reqJson<{ selectedTierKey: string; customItems: string[] }>(
      '/api/v1/my/groom-plan',
      { cookie: saraCookie },
    );
    expect(saraGetGroom.body.data?.selectedTierKey).not.toBe('tier_300k');
    expect(saraGetGroom.body.data?.customItems).not.toContain('ديب فريزر رأسى 6 درج');

    // 4. Sara updates bridal plan and persists cleanly
    const saraPutBride = await reqJson<{
      presetMode: string;
      checkedItemIds: string[];
      qtyOverrides: Record<string, number>;
      customItems: { id: string }[];
    }>('/api/v1/my/bride-plan', {
      method: 'PUT',
      cookie: saraCookie,
      body: JSON.stringify({
        presetMode: 'extended',
        targetBudgetEgp: 135000,
        checkedItemIds: ['chk-1', 'chk-2', 'chk-4'],
        qtyOverrides: { 'chk-8': 10 },
        customItems: [
          {
            id: 'custom-sara-1',
            categoryId: 'b-cat-05',
            labelAr: 'ماكينة قهوة',
            labelEn: 'Espresso Maker',
            qty: 1,
            estimatedUnitPriceEgp: 8500,
            checked: false,
          },
        ],
      }),
    });
    expect(saraPutBride.status).toBe(200);
    expect(saraPutBride.body.data?.presetMode).toBe('extended');
    expect(saraPutBride.body.data?.qtyOverrides['chk-8']).toBe(10);
    expect(saraPutBride.body.data?.customItems.length).toBe(1);

    // 5. Verify audit log records both planner updates
    const adminLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@gawazinn.demo', password: 'AdminPass@2026' }),
    });
    const adminCookie = extractSessionCookie(adminLogin.setCookie);
    const adminOverview = await reqJson<{ auditLogs: { action: string }[] }>('/api/v1/admin/overview', {
      cookie: adminCookie,
    });
    expect(adminOverview.body.data?.auditLogs.some((l) => l.action === 'planner.groom_updated')).toBe(true);
    expect(adminOverview.body.data?.auditLogs.some((l) => l.action === 'planner.bride_updated')).toBe(true);
  });
});

