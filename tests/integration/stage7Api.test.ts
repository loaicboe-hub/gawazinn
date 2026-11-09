import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import type {
  AuditLogEntry,
  LocalCategoryGuidePayload,
  VendorBillingRecord,
  VendorCategory,
  VendorListing,
  VendorPortalOverviewPayload,
  VendorReview,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-stage7-vendor-marketplace-secret';

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
  expect(secondSeed.stage7Seeded).toBe(false);

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

describe('Stage 7 Vendor Marketplace, Governance Decoupling, Quotas, Reviews & Local SEO API', () => {
  it('exposes 17 categories, filterable vendors, location+category guides & clean sitemap (excluding private /vendor portal)', async () => {
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/vendors</loc>');
    expect(xml).toContain('/vendors/el-rowad-contracting</loc>');
    expect(xml).toContain('/locations/cairo/turnkey_finishing</loc>');
    expect(xml).not.toContain('/vendor</loc>');

    const catsRes = await reqJson<VendorCategory[]>('/api/v1/vendor-categories');
    expect(catsRes.status).toBe(200);
    expect(catsRes.body.data?.length).toBe(17);

    const vendorsRes = await reqJson<VendorListing[]>(
      '/api/v1/vendors?domain=finishing&sortBy=price_asc',
    );
    expect(vendorsRes.status).toBe(200);
    const finVendors = vendorsRes.body.data || [];
    expect(finVendors.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < finVendors.length; i += 1) {
      expect(finVendors[i].startingPriceEgp).toBeGreaterThanOrEqual(
        finVendors[i - 1].startingPriceEgp,
      );
    }

    const guideRes = await reqJson<LocalCategoryGuidePayload>(
      '/api/v1/locations/cairo/turnkey_finishing',
    );
    expect(guideRes.status).toBe(200);
    expect(guideRes.body.data?.category?.slug).toBe('turnkey_finishing');
    expect(guideRes.body.data?.regionalBaselineMin).toBeGreaterThan(200000);
    expect(
      guideRes.body.data?.matchedVendors.some((v) => v.slug === 'el-rowad-contracting'),
    ).toBe(true);
  });

  it('enforces plan quotas, strictly decouples commercial subscription upgrades from admin-only verification, and writes audit logs', async () => {
    const vendorLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'vendor@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const vendorCookie = extractSessionCookie(vendorLogin.setCookie);

    const adminLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@gawazinn.demo', password: 'AdminPass@2026' }),
    });
    const adminCookie = extractSessionCookie(adminLogin.setCookie);

    const karimLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    // 1. Free plan quota enforcement on vnd-el-rowad (3/3 services used, 0/0 promos)
    const exceedServiceRes = await reqJson('/api/v1/vendor-portal/services?vendorId=vnd-el-rowad', {
      method: 'POST',
      cookie: vendorCookie,
      body: JSON.stringify({
        titleAr: 'خدمة إضافية رابعة',
        titleEn: 'Fourth Extra Service',
        descriptionAr: 'وصف خدمة رابعة لتجربة حد الباقة المجانية',
        descriptionEn: 'Testing free plan 3-service cap limit cleanly',
        unitLabelAr: 'بالمتر',
        unitLabelEn: 'Per m²',
        startingPriceEgp: 1200,
      }),
    });
    expect(exceedServiceRes.status).toBe(403);
    expect(exceedServiceRes.body.error?.code).toBe('PLAN_QUOTA_EXCEEDED');

    const exceedPromoRes = await reqJson(
      '/api/v1/vendor-portal/promotions?vendorId=vnd-el-rowad',
      {
        method: 'POST',
        cookie: vendorCookie,
        body: JSON.stringify({
          titleAr: 'خصم باقة مجانية',
          titleEn: 'Free Plan Promo Attempt',
          descriptionAr: 'محاولة نشر عرض على الباقة المجانية',
          descriptionEn: 'Attempting promo on 0-promo free plan tier',
          discountPercent: 10,
          validUntil: '2026-12-31',
        }),
      },
    );
    expect(exceedPromoRes.status).toBe(403);
    expect(exceedPromoRes.body.error?.code).toBe('PLAN_QUOTA_EXCEEDED');

    // 2. Ownership RBAC: karim cannot manage vendor's listing
    const otherOwnerAttempt = await reqJson('/api/v1/vendor-portal/overview?vendorId=vnd-baytk-care', {
      cookie: karimCookie,
    });
    expect(otherOwnerAttempt.status).toBe(403);

    // 3. Switching vnd-baytk-care ('registered' + 'plan_free') to 'premium' monthly:
    //    MUST create billing ledger + unlock promotions, MUST NOT alter verificationStatus ('registered')!
    const subRes = await reqJson<{
      billingRecord: VendorBillingRecord;
      overview: VendorPortalOverviewPayload;
    }>('/api/v1/vendor-portal/subscription?vendorId=vnd-baytk-care', {
      method: 'POST',
      cookie: vendorCookie,
      body: JSON.stringify({ planCode: 'premium', billingCycle: 'monthly' }),
    });
    expect(subRes.status).toBe(200);
    expect(subRes.body.data?.billingRecord.amountEgp).toBe(2900);
    expect(subRes.body.data?.overview.vendor?.subscriptionPlanCode).toBe('premium');
    expect(subRes.body.data?.overview.vendor?.isFeaturedCommercial).toBe(true);
    expect(subRes.body.data?.overview.vendor?.verificationStatus).toBe('registered');
    expect(subRes.body.data?.overview.quotas.maxPromotions).toBe(15);

    // Now vnd-baytk-care CAN publish a seasonal promotion
    const promoOk = await reqJson('/api/v1/vendor-portal/promotions?vendorId=vnd-baytk-care', {
      method: 'POST',
      cookie: vendorCookie,
      body: JSON.stringify({
        titleAr: 'فحص أجهزة ما قبل الصيف',
        titleEn: 'Pre-Summer AC Maintenance Deal',
        descriptionAr: 'خصم 15% على فحص وصيانة التكييفات والسباكة للعروسين.',
        descriptionEn: '15% discount on newlywed apartment HVAC and plumbing audit.',
        discountPercent: 15,
        promoCode: 'CARE15',
        validUntil: '2026-12-31',
      }),
    });
    expect(promoOk.status).toBe(201);

    // 4. Non-admin cannot verify vendor
    const nonAdminVerify = await reqJson('/api/v1/admin/vendors/vnd-baytk-care/verify', {
      method: 'PATCH',
      cookie: vendorCookie,
      body: JSON.stringify({ verificationStatus: 'trusted' }),
    });
    expect(nonAdminVerify.status).toBe(403);

    // 5. Admin audits and promotes vnd-baytk-care to 'trusted', keeping commercial plan intact + recording audit_log
    const adminVerify = await reqJson<VendorListing>(
      '/api/v1/admin/vendors/vnd-baytk-care/verify',
      {
        method: 'PATCH',
        cookie: adminCookie,
        body: JSON.stringify({
          verificationStatus: 'trusted',
          verificationDocs: ['السجل التجاري #88412', 'البطاقة الضريبية'],
          verificationNotes: 'تمت مراجعة الأوراق والمعاينة الميدانية بنجاح',
        }),
      },
    );
    expect(adminVerify.status).toBe(200);
    expect(adminVerify.body.data?.verificationStatus).toBe('trusted');
    expect(adminVerify.body.data?.subscriptionPlanCode).toBe('premium');

    const auditRes = await reqJson<AuditLogEntry[]>('/api/v1/admin/audit-logs', {
      cookie: adminCookie,
    });
    expect(
      auditRes.body.data?.some(
        (l) => l.action === 'admin.vendor_verified' && l.targetId === 'vnd-baytk-care',
      ),
    ).toBe(true);
  });

  it('handles self-registration defaulting to registered+free, blocks owner self-reviews & aggregates authentic reviews', async () => {
    const vendorLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'vendor@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const vendorCookie = extractSessionCookie(vendorLogin.setCookie);

    const karimLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    // Self-registration defaults strictly to registered + free
    const regRes = await reqJson<VendorListing>('/api/v1/vendors/register', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        businessNameAr: 'ورشة النيل للأثاث الدمياطي',
        businessNameEn: 'Nile Damietta Solid Wood Atelier',
        primaryCategorySlug: 'bedroom_furniture',
        governorateSlug: 'damietta',
        serviceAreas: ['damietta', 'cairo'],
        addressAr: 'دمياط — شارع الجلاء التجاري',
        addressEn: 'El-Galaa Commercial St, Damietta',
        phone: '01099887766',
        bioAr: 'تصنيع غرف النوم والسفرة من خشب الزان الروماني الطبيعي بضمان خمس سنوات.',
        bioEn: 'Crafted solid beechwood bedrooms and dining sets shipped directly from Damietta.',
        priceTier: 'mid',
        startingPriceEgp: 42000,
        yearsExperience: 6,
      }),
    });
    expect(regRes.status).toBe(201);
    expect(regRes.body.data?.verificationStatus).toBe('registered');
    expect(regRes.body.data?.subscriptionPlanCode).toBe('free');

    // Vendor owner cannot review own listing
    const selfRev = await reqJson('/api/v1/vendors/el-rowad-contracting/reviews', {
      method: 'POST',
      cookie: vendorCookie,
      body: JSON.stringify({
        rating: 5,
        title: 'تقييم ذاتي مرفوض',
        comment: 'لا يجوز لمالك النشاط تقييم شركته بنفسه مطلقاً.',
      }),
    });
    expect(selfRev.status).toBe(403);
    expect(selfRev.body.error?.code).toBe('SELF_REVIEW_FORBIDDEN');

    // Customer submits real review -> ratingAvg & reviewsCount recomputed from 0 to 5.0 (1)
    const realRev = await reqJson<{ review: VendorReview; vendor: VendorListing }>(
      '/api/v1/vendors/el-rowad-contracting/reviews',
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          rating: 5,
          title: 'انضباط تام في المواصفات ومواعيد التسليم',
          comment: 'تم استلام شقة التجمع الخامس بمطابقة كاملة لبنود الكشف المتفق عليها.',
        }),
      },
    );
    expect(realRev.status).toBe(201);
    expect(realRev.body.data?.vendor.ratingAvg).toBe(5);
    expect(realRev.body.data?.vendor.reviewsCount).toBe(1);

    // Duplicate review from same customer blocked with 409
    const dupRev = await reqJson('/api/v1/vendors/el-rowad-contracting/reviews', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        rating: 4,
        title: 'محاولة تقييم ثانية',
        comment: 'يمنع النظام تكرار التقييم لنفس النشاط من نفس الحساب.',
      }),
    });
    expect(dupRev.status).toBe(409);
  });
});
