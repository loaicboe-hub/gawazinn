import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import type {
  AuditLogEntry,
  BudgetOverviewPayload,
  MarketplaceAppointment,
  MyGawazInnHubPayload,
  RfqQuote,
  RfqRequest,
  VendorCrmOverviewPayload,
  VendorLead,
  VendorLeadActivity,
  VendorListing,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-stage8-rfq-crm-secret';

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
  expect(secondSeed.stage8Seeded).toBe(false);

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

describe('Stage 8 Multi-Vendor RFQ Engine, Slot Appointments & 8-Stage Vendor CRM API', () => {
  it('enforces multi-vendor confidentiality, Q&A isolation, atomic quote acceptance -> Wedding Budget sync, and 8-stage CRM', async () => {
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).not.toContain('/rfq</loc>');

    // 1. Login Karim (Customer A), Vendor A (owner of vnd-el-rowad), Sara (Uninvited User)
    const karimLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    const vendorALogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'vendor@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const vendorACookie = extractSessionCookie(vendorALogin.setCookie);

    const saraLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const saraCookie = extractSessionCookie(saraLogin.setCookie);

    // Register independent Competing Vendor B user + vendor listing in turnkey_finishing / cairo
    const vendorBReg = await reqJson('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'مهندس شريف لتشطيبات القاهرة',
        email: 'sherif-vendor@gawazinn.test',
        phone: '01099887766',
        password: 'VendorPass@2026',
        city: 'القاهرة',
      }),
    });
    expect(vendorBReg.status).toBe(201);
    const vendorBCookie = extractSessionCookie(vendorBReg.setCookie);

    const createVendorBRes = await reqJson<VendorListing>('/api/v1/vendors/register', {
      method: 'POST',
      cookie: vendorBCookie,
      body: JSON.stringify({
        businessNameAr: 'مكتب شريف للتشطيب المتكامل',
        businessNameEn: 'Sherif Integrated Finishing Studio',
        primaryCategorySlug: 'turnkey_finishing',
        governorateSlug: 'cairo',
        serviceAreas: ['cairo'],
        addressAr: 'التجمع الخامس - القاهرة الجديدة',
        addressEn: 'Fifth Settlement, New Cairo',
        phone: '01099887766',
        bioAr: 'شركة متخصصة في تسليم الشقق المفتاح بأعلى جودة ومعايير هندسية.',
        bioEn: 'Specialized apartment turnkey contractor in Cairo.',
        priceTier: 'mid',
        startingPriceEgp: 195000,
      }),
    });
    expect(createVendorBRes.status).toBe(201);
    const vendorB = createVendorBRes.body.data!;

    // Verify Sara cannot view Karim's seeded RFQ
    const unauthRfqRes = await reqJson('/api/v1/rfq/rfq-seed-1', { cookie: saraCookie });
    expect(unauthRfqRes.status).toBe(403);

    // 2. Karim submits a Multi-Vendor RFQ in turnkey_finishing / cairo
    const createRfqRes = await reqJson<RfqRequest>('/api/v1/rfq', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        title: 'تشطيب شقة 145م بالمقايسة الهندسية — مدينة نصر',
        categorySlug: 'turnkey_finishing',
        governorateSlug: 'cairo',
        budgetMin: 210000,
        budgetMax: 320000,
        desiredDate: '2026-12-25',
        scopeDetails: 'تشطيب شامل كهرباء وسباكة وسيراميك وجيبسوم بورد ودهانات جوتن بالضمان.',
        requirements: { areaSqm: 145, bathrooms: 2 },
        preferredContact: 'platform',
      }),
    });
    expect(createRfqRes.status).toBe(201);
    const createdRfq = createRfqRes.body.data!;
    expect((createdRfq.invitations || []).some((i) => i.vendorId === 'vnd-el-rowad')).toBe(true);
    expect((createdRfq.invitations || []).some((i) => i.vendorId === vendorB.id)).toBe(true);

    // 3. Auto-created CRM new_lead appears for both invited vendors
    const crmARes = await reqJson<VendorCrmOverviewPayload>(
      '/api/v1/vendor-portal/crm?vendorId=vnd-el-rowad',
      { cookie: vendorACookie },
    );
    expect(crmARes.status).toBe(200);
    const leadA = crmARes.body.data?.leads.find((l) => l.rfqId === createdRfq.id);
    expect(leadA?.stage).toBe('new_lead');

    const crmBRes = await reqJson<VendorCrmOverviewPayload>('/api/v1/vendor-portal/crm', {
      cookie: vendorBCookie,
    });
    expect(crmBRes.status).toBe(200);
    const leadB = crmBRes.body.data?.leads.find((l) => l.rfqId === createdRfq.id);
    expect(leadB?.stage).toBe('new_lead');

    // 4. Both vendors submit sealed competing quotes + private Q&A messages
    const quoteARes = await reqJson<{ quote: RfqQuote; rfq: RfqRequest }>(
      `/api/v1/rfq/${createdRfq.id}/quotes`,
      {
        method: 'POST',
        cookie: vendorACookie,
        body: JSON.stringify({
          vendorId: 'vnd-el-rowad',
          quotedAmountEgp: 268000,
          depositAmountEgp: 40000,
          estimatedDuration: '60 يوم',
          warrantyMonths: 36,
          scopeSummary: 'توريد وتركيب بالكامل طبقاً للمقايسة وبإشراف هندسي أسبوعي.',
          validUntil: '2026-12-30',
        }),
      },
    );
    expect(quoteARes.status).toBe(201);

    const quoteBRes = await reqJson<{ quote: RfqQuote; rfq: RfqRequest }>(
      `/api/v1/rfq/${createdRfq.id}/quotes`,
      {
        method: 'POST',
        cookie: vendorBCookie,
        body: JSON.stringify({
          quotedAmountEgp: 242000,
          depositAmountEgp: 30000,
          estimatedDuration: '55 يوم',
          warrantyMonths: 48,
          scopeSummary: 'عرض خاص شريف إنترجريتد شامل أسلاك السويدي ومواسير BR وضمان 4 سنوات.',
          validUntil: '2026-12-30',
        }),
      },
    );
    expect(quoteBRes.status).toBe(201);
    const quoteB = quoteBRes.body.data!.quote;

    // Confidential Q&A message from Vendor A
    const msgARes = await reqJson(`/api/v1/rfq/${createdRfq.id}/messages?vendorId=vnd-el-rowad`, {
      method: 'POST',
      cookie: vendorACookie,
      body: JSON.stringify({ body: 'رسالة سرية خاصة بشركة الرواد فقط عن خصم الدفع الكاش' }),
    });
    expect(msgARes.status).toBe(201);

    // STRICT CONFIDENTIALITY CHECK: Vendor B MUST ONLY see its own quote (242000) & zero Vendor A quote/messages!
    const vendorBView = await reqJson<RfqRequest>(`/api/v1/rfq/${createdRfq.id}`, {
      cookie: vendorBCookie,
    });
    expect(vendorBView.status).toBe(200);
    expect(vendorBView.body.data?.quotes?.length).toBe(1);
    expect(vendorBView.body.data?.quotes?.[0].vendorId).toBe(vendorB.id);
    expect(vendorBView.body.data?.quotes?.[0].quotedAmountEgp).toBe(242000);
    expect(vendorBView.body.data?.invitations?.length).toBe(1);
    expect(vendorBView.body.data?.messages?.some((m) => m.body.includes('الرواد'))).toBe(false);

    // Non-invited vendor cannot submit quote (403)
    const uninvitedQuote = await reqJson(`/api/v1/rfq/${createdRfq.id}/quotes`, {
      method: 'POST',
      cookie: vendorACookie,
      body: JSON.stringify({
        vendorId: 'vnd-shabka-almas',
        quotedAmountEgp: 200000,
        depositAmountEgp: 20000,
        estimatedDuration: '30 يوم',
        warrantyMonths: 12,
        scopeSummary: 'غير مدعو على هذا التصنيف التجاري',
        validUntil: '2026-12-30',
      }),
    });
    expect(uninvitedQuote.status).toBe(403);

    // 5. Customer Karim sees BOTH quotes to compare, accepts Vendor B's 242,000 EGP quote with linkToBudget=true
    const karimView = await reqJson<RfqRequest>(`/api/v1/rfq/${createdRfq.id}`, {
      cookie: karimCookie,
    });
    expect(karimView.status).toBe(200);
    expect(karimView.body.data?.quotes?.length).toBe(2);

    const acceptRes = await reqJson<{ rfq: RfqRequest; linkedBudgetExpenseId: string | null }>(
      `/api/v1/rfq/${createdRfq.id}/quotes/${quoteB.id}/decide`,
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({ decision: 'accept', linkToBudget: true }),
      },
    );
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data?.rfq.status).toBe('accepted');
    expect(acceptRes.body.data?.linkedBudgetExpenseId).toBeTruthy();

    // Verify Wedding Budget Manager received synced expense
    const budgetRes = await reqJson<BudgetOverviewPayload>('/api/v1/budget/overview', {
      cookie: karimCookie,
    });
    expect(budgetRes.status).toBe(200);
    const linkedExp = budgetRes.body.data?.expenses.find(
      (e) => e.sourceType === 'rfq_quote' && e.sourceId === createdRfq.id,
    );
    expect(linkedExp).toBeTruthy();
    expect(linkedExp?.amount).toBe(242000);

    // Winning vendor CRM moved -> 'accepted', competing vendor lead closed -> 'lost'
    const postAcceptCrmB = await reqJson<VendorCrmOverviewPayload>('/api/v1/vendor-portal/crm', {
      cookie: vendorBCookie,
    });
    expect(
      postAcceptCrmB.body.data?.leads.find((l) => l.rfqId === createdRfq.id)?.stage,
    ).toBe('accepted');

    const postAcceptCrmA = await reqJson<VendorCrmOverviewPayload>(
      '/api/v1/vendor-portal/crm?vendorId=vnd-el-rowad',
      { cookie: vendorACookie },
    );
    expect(
      postAcceptCrmA.body.data?.leads.find((l) => l.rfqId === createdRfq.id)?.stage,
    ).toBe('lost');

    // 6. Marketplace Slot Appointments: Customer books 'requested' -> blocked from confirming (403) -> Vendor confirms -> Customer notified
    const bookAptRes = await reqJson<MarketplaceAppointment>('/api/v1/appointments', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        vendorId: vendorB.id,
        rfqId: createdRfq.id,
        appointmentType: 'site_visit',
        slotDate: '2026-12-18',
        slotTime: '15:00',
        durationMinutes: 60,
        customerPhone: '01012345678',
        customerNotes: 'معاينة الشقة قبل بدء أعمال التكسير',
      }),
    });
    expect(bookAptRes.status).toBe(201);
    const apt = bookAptRes.body.data!;
    expect(apt.status).toBe('requested');

    const selfConfirmAttempt = await reqJson(`/api/v1/appointments/${apt.id}`, {
      method: 'PATCH',
      cookie: karimCookie,
      body: JSON.stringify({ status: 'confirmed' }),
    });
    expect(selfConfirmAttempt.status).toBe(403);
    expect(selfConfirmAttempt.body.error?.code).toBe('CUSTOMER_CANNOT_CONFIRM');

    const vendorConfirmRes = await reqJson<MarketplaceAppointment>(`/api/v1/appointments/${apt.id}`, {
      method: 'PATCH',
      cookie: vendorBCookie,
      body: JSON.stringify({
        status: 'confirmed',
        vendorResponseNote: 'تم التأكيد — المهندس المشرف سيكون متواجداً في الموعد',
      }),
    });
    expect(vendorConfirmRes.status).toBe(200);
    expect(vendorConfirmRes.body.data?.status).toBe('confirmed');
    expect(vendorConfirmRes.body.data?.confirmedAt).toBeTruthy();

    // Check notification delivered to Karim's hub
    const karimHub = await reqJson<MyGawazInnHubPayload>('/api/v1/my/hub', { cookie: karimCookie });
    expect(karimHub.status).toBe(200);
    expect(
      karimHub.body.data?.notifications.some(
        (n) => n.titleEn.includes('Appointment Update') && n.titleEn.includes('confirmed'),
      ),
    ).toBe(true);

    // 7. Vendor CRM: Manual Lead creation + 8-Stage progress + Activity logging
    const manualLeadRes = await reqJson<{ lead: VendorLead; crm: VendorCrmOverviewPayload }>(
      '/api/v1/vendor-portal/crm/leads',
      {
        method: 'POST',
        cookie: vendorBCookie,
        body: JSON.stringify({
          customerName: 'أ. محمود هاني',
          customerPhone: '01144556677',
          title: 'تشطيب دوبلكس الشيخ زايد',
          stage: 'contacted',
          estimatedValueEgp: 510000,
        }),
      },
    );
    expect(manualLeadRes.status).toBe(201);
    const manualLead = manualLeadRes.body.data!.lead;

    const patchLeadRes = await reqJson<{ lead: VendorLead; crm: VendorCrmOverviewPayload }>(
      `/api/v1/vendor-portal/crm/leads/${manualLead.id}`,
      {
        method: 'PATCH',
        cookie: vendorBCookie,
        body: JSON.stringify({ stage: 'in_progress' }),
      },
    );
    expect(patchLeadRes.status).toBe(200);
    expect(patchLeadRes.body.data?.lead.stage).toBe('in_progress');
    expect(patchLeadRes.body.data?.crm.wonValueEgp).toBeGreaterThanOrEqual(752000);

    const actRes = await reqJson<{ activity: VendorLeadActivity; crm: VendorCrmOverviewPayload }>(
      `/api/v1/vendor-portal/crm/leads/${manualLead.id}/activities`,
      {
        method: 'POST',
        cookie: vendorBCookie,
        body: JSON.stringify({
          activityType: 'call',
          note: 'تم اعتماد جدول استلام الدفعة الأولى وبدء بند التأسيس الكهربائي.',
        }),
      },
    );
    expect(actRes.status).toBe(201);

    // Audit log check via admin
    const adminLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@gawazinn.demo', password: 'AdminPass@2026' }),
    });
    const adminCookie = extractSessionCookie(adminLogin.setCookie);
    const logsRes = await reqJson<AuditLogEntry[]>('/api/v1/admin/audit-logs', {
      cookie: adminCookie,
    });
    expect(logsRes.status).toBe(200);
    const actions = new Set((logsRes.body.data || []).map((l) => l.action));
    expect(actions.has('rfq.created')).toBe(true);
    expect(actions.has('rfq.quote_submitted')).toBe(true);
    expect(actions.has('rfq.quote_decided')).toBe(true);
    expect(actions.has('appointment.created')).toBe(true);
    expect(actions.has('appointment.updated')).toBe(true);
    expect(actions.has('vendor_crm.lead_updated')).toBe(true);
  });
});

