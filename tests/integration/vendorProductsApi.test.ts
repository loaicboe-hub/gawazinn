import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import type {
  Product,
  ProductEncyclopediaDetail,
  VendorListing,
  VendorPortalOverviewPayload,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-vendor-products-secret-key-32chars';

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
  runMigrations(db);
  seedDatabase(db);

  const handler = createAppHandler(db, {
    sessionSecret: TEST_SECRET,
    appOrigin: 'http://localhost:3000',
    sessionTtlSeconds: 3600,
    isProduction: false,
  });

  server = http.createServer(handler);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}/api/v1`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  db.close();
});

describe('Vendor Physical Product Catalog API (Multi-Vendor Marketplace)', () => {
  let vendorCookie = '';
  let vendorSlug = '';
  let vendorId = '';
  let createdProductId = '';
  let createdProductSlug = '';

  it('authenticates demo vendor owner (vendor@gawazinn.demo)', async () => {
    const res = await reqJson<{ user: { id: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'vendor@gawazinn.demo',
        password: 'DemoPass@2026',
      }),
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    vendorCookie = extractSessionCookie(res.setCookie);
    expect(vendorCookie).toBeTruthy();
  });

  it('retrieves vendor portal overview and vendor identity', async () => {
    const res = await reqJson<VendorPortalOverviewPayload>('/vendor-portal/overview', {
      cookie: vendorCookie,
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data?.vendor).toBeTruthy();
    vendorSlug = res.body.data!.vendor!.slug;
    vendorId = res.body.data!.vendor!.id;
    expect(Array.isArray(res.body.data?.products)).toBe(true);
  });

  it('creates a new physical product listing under vendor account', async () => {
    const res = await reqJson<{ product: Product; overview: VendorPortalOverviewPayload }>(
      '/vendor-portal/products',
      {
        method: 'POST',
        cookie: vendorCookie,
        body: JSON.stringify({
          nameAr: 'ثلاجة شارب إنفرتر 450 لتر ديجيتال',
          nameEn: 'Sharp Inverter 450L Digital Refrigerator',
          category: 'refrigerators',
          categoryAr: 'ثلاجات وديب فريزر',
          categoryEn: 'Refrigerators & Freezers',
          trousseauType: 'shared',
          brand: 'Sharp',
          model: 'SJ-GV58G-SL',
          price: 32500,
          originalPrice: 36000,
          stock: 4,
          imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
          descriptionAr: 'ثلاجة شارب توشيبا العربي الأصلية مع بطاقة الضمان المعتمد 10 سنوات شامل الصيانة المنزلية.',
          warrantyMonths: 120,
          warrantyTermsAr: 'ضمان العربي جروب الرسمي 10 سنوات شامل الموتور وقطع الغيار الأصلية',
          dimensions: '175x70x72 سم',
          capacity: '450 لتر',
          energyRating: 'A',
        }),
      },
    );

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data?.product).toBeTruthy();

    const prod = res.body.data!.product;
    createdProductId = prod.id;
    createdProductSlug = prod.slug || prod.id;

    expect(prod.nameAr).toBe('ثلاجة شارب إنفرتر 450 لتر ديجيتال');
    expect(prod.price).toBe(32500);
    expect(prod.originalPrice).toBe(36000);
    expect(prod.stock).toBe(4);
    expect(prod.vendorId).toBe(vendorId);
    expect(prod.vendorSummary?.businessNameAr).toBeTruthy();

    // Verify overview was returned with updated products
    const overviewProducts = res.body.data!.overview.products;
    expect(overviewProducts?.some((p) => p.id === createdProductId)).toBe(true);
  });

  it('lists vendor products via GET /vendor-portal/products', async () => {
    const res = await reqJson<Product[]>('/vendor-portal/products', {
      cookie: vendorCookie,
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data!.some((p) => p.id === createdProductId)).toBe(true);
  });

  it('displays the vendor product on public vendor detail GET /vendors/:slug', async () => {
    const res = await reqJson<VendorListing>(`/vendors/${vendorSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data?.products)).toBe(true);
    const listed = res.body.data!.products!.find((p) => p.id === createdProductId);
    expect(listed).toBeTruthy();
    expect(listed!.price).toBe(32500);
  });

  it('displays the product detail with vendorSummary via GET /products/:slug', async () => {
    const res = await reqJson<ProductEncyclopediaDetail>(`/products/${createdProductSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data?.product.vendorId).toBe(vendorId);
    expect(res.body.data?.product.vendorSummary).toBeTruthy();
    expect(res.body.data?.product.vendorSummary?.slug).toBe(vendorSlug);
  });

  it('updates product price and stock via PATCH /vendor-portal/products/:id', async () => {
    const res = await reqJson<{ product: Product; overview: VendorPortalOverviewPayload }>(
      `/vendor-portal/products/${createdProductId}`,
      {
        method: 'PATCH',
        cookie: vendorCookie,
        body: JSON.stringify({
          price: 31900,
          stock: 3,
        }),
      },
    );

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data?.product.price).toBe(31900);
    expect(res.body.data?.product.stock).toBe(3);
  });

  it('enforces isolation: rejects unauthenticated or unauthorized deletion', async () => {
    // Unauthenticated
    const anonRes = await reqJson(`/vendor-portal/products/${createdProductId}`, {
      method: 'DELETE',
    });
    expect(anonRes.status).toBe(401);

    // Another non-vendor account login
    const coupleLogin = await reqJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'karim@gawazinn.demo',
        password: 'DemoPass@2026',
      }),
    });
    const coupleCookie = extractSessionCookie(coupleLogin.setCookie);

    const coupleDelete = await reqJson(`/vendor-portal/products/${createdProductId}`, {
      method: 'DELETE',
      cookie: coupleCookie,
    });
    expect([403, 404]).toContain(coupleDelete.status);
  });

  it('deletes vendor product via DELETE /vendor-portal/products/:id', async () => {
    const res = await reqJson<{ success: boolean; overview: VendorPortalOverviewPayload }>(
      `/vendor-portal/products/${createdProductId}`,
      {
        method: 'DELETE',
        cookie: vendorCookie,
      },
    );

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    // Verify product is no longer in vendor products list
    const checkRes = await reqJson<Product[]>('/vendor-portal/products', {
      cookie: vendorCookie,
    });
    expect(checkRes.body.data!.some((p) => p.id === createdProductId)).toBe(false);
  });
});
