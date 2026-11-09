import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import assert from 'node:assert/strict';
import { chromium, type Browser, type Page } from 'playwright-core';
import { openDatabase, runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter((p): p is string => Boolean(p && fs.existsSync(p)));

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage8.db');
const E2E_SECRET = 'e2e-stage8-rfq-crm-secret';

async function waitForUrl(url: string, timeoutMs = 20000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Retry until ready
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function dismissIntroIfPresent(page: Page): Promise<void> {
  const skipBtn = page.getByTestId('intro-skip-btn');
  if (await skipBtn.isVisible().catch(() => false)) {
    await skipBtn.click();
    await page.getByTestId('intro-splash').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}

async function assertNoHorizontalOverflow(page: Page, contextLabel: string): Promise<void> {
  const report = await page.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const offenders: string[] = [];
    if (sw > cw + 1) {
      document.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > cw + 1 || r.left < -1)) {
          offenders.push(
            `${el.tagName}.${String(el.className).slice(0, 60)} [left=${Math.round(r.left)}, right=${Math.round(r.right)}, w=${Math.round(r.width)}]`,
          );
        }
      });
    }
    return { scrollWidth: sw, clientWidth: cw, offenders: offenders.slice(0, 8) };
  });
  assert.ok(
    report.scrollWidth <= report.clientWidth + 1,
    `Horizontal overflow detected at ${contextLabel}: scrollWidth=${report.scrollWidth}, clientWidth=${report.clientWidth}\nOffenders:\n${report.offenders.join('\n')}`,
  );
}

async function loginViaModal(page: Page, identifier: string, password: string): Promise<void> {
  await page.getByTestId('header-login-btn').waitFor({ state: 'visible' });
  await page.getByTestId('header-login-btn').click();
  await page.getByTestId('auth-identifier-input').waitFor({ state: 'visible' });
  await page.getByTestId('auth-identifier-input').fill(identifier);
  await page.getByTestId('auth-password-input').fill(password);
  const done = page.waitForResponse((res) => res.url().includes('/api/v1/auth/login'));
  await page.getByTestId('auth-submit-btn').click();
  const res = await done;
  assert.equal(res.status(), 200, `Login failed for ${identifier} with HTTP ${res.status()}`);
}

async function logoutViaMenu(page: Page): Promise<void> {
  await page.getByTestId('user-menu-btn').click();
  const logoutBtn = page.locator('header button', { hasText: /تسجيل الخروج|Log Out/i }).first();
  const done = page.waitForResponse(
    (res) => res.url().includes('/api/v1/auth/logout') && res.status() === 200,
  );
  await logoutBtn.click();
  await done;
  await page.getByTestId('header-login-btn').waitFor({ state: 'visible' });
}

async function main() {
  if (CHROME_CANDIDATES.length === 0) {
    throw new Error('No Chromium/Chrome executable found for Stage 8 E2E tests.');
  }

  for (const ext of ['', '-wal', '-shm']) {
    const file = TEMP_DB_PATH + ext;
    if (fs.existsSync(file)) fs.rmSync(file, { force: true });
  }

  const db = openDatabase(TEMP_DB_PATH);
  runMigrations(db);
  seedDatabase(db, E2E_SECRET);

  let apiPort = 0;
  const apiServer = http.createServer(
    createAppHandler(db, {
      sessionSecret: E2E_SECRET,
      appOrigin: 'http://127.0.0.1:4178',
      sessionTtlSeconds: 3600,
      isProduction: false,
    }),
  );

  await new Promise<void>((resolve) => {
    apiServer.listen(0, '127.0.0.1', () => {
      const addr = apiServer.address();
      if (addr && typeof addr !== 'string') apiPort = addr.port;
      resolve();
    });
  });

  const viteEntry = path.resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
  const webProc: ChildProcess = spawn(
    process.execPath,
    [viteEntry, 'preview', '--port', '4178', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

  const webUrl = 'http://127.0.0.1:4178';
  let browser: Browser | null = null;
  const errors: string[] = [];

  try {
    await waitForUrl(webUrl);
    browser = await chromium.launch({
      executablePath: CHROME_CANDIDATES[0],
      headless: true,
    });

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      errors.push(`pageerror: ${err.message}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        errors.push(`HTTP ${res.status()} on ${res.url()}`);
      }
    });

    // 1. Desktop (1440x900): Open Vendor Profile -> Sign In as Customer -> Book Slot Appointment
    await page.goto(`${webUrl}/vendors/el-rowad-contracting`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('vendor-request-rfq-btn').waitFor({ state: 'visible' });
    await page.getByTestId('vendor-slot-booking-card').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'desktop /vendors/el-rowad-contracting');

    await loginViaModal(page, 'karim@gawazinn.demo', 'DemoPass@2026');

    await page.getByTestId('vendor-apt-type').selectOption('site_visit');
    await page.getByTestId('vendor-apt-date').fill('2026-12-22');
    await page.getByTestId('vendor-apt-time').selectOption('14:00');
    await page.getByTestId('vendor-apt-notes').fill('معاينة شقة التجمع لبدء البنود الهندسية');
    const aptCreateDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/appointments') && res.request().method() === 'POST',
    );
    await page.getByTestId('vendor-apt-submit-btn').click();
    const aptCreateRes = await aptCreateDone;
    assert.equal(aptCreateRes.status(), 201);
    const createdAptJson = (await aptCreateRes.json()) as { data: { id: string } };
    const createdAptId = createdAptJson.data.id;
    await page.getByTestId('vendor-booking-success').waitFor({ state: 'visible' });

    // 2. Customer clicks Request Quote (RFQ) -> lands on /rfq/new prefilled -> Submits Multi-Vendor RFQ
    await page.getByTestId('vendor-request-rfq-btn').click();
    await page.getByTestId('rfq-create-form').waitFor({ state: 'visible' });
    await page.getByTestId('rfq-title-input').fill('E2E تشطيب شقة 150م التجمع');
    await page.getByTestId('rfq-budget-min').fill('250000');
    await page.getByTestId('rfq-budget-max').fill('340000');
    await page.getByTestId('rfq-scope-input').fill(
      'تشطيب شامل تأسيس السباكة والكهرباء والبورسلين ودهانات جوتن بالجدول الزمني المحدد.',
    );
    const rfqCreateDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/rfq') && res.request().method() === 'POST',
    );
    await page.getByTestId('rfq-submit-btn').click();
    const rfqCreateRes = await rfqCreateDone;
    assert.equal(rfqCreateRes.status(), 201);
    const createdRfqJson = (await rfqCreateRes.json()) as { data: { id: string } };
    const newRfqId = createdRfqJson.data.id;

    await page.getByTestId(`rfq-card-${newRfqId}`).waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'desktop /rfq after create');

    // 3. Logout -> Login as Vendor -> Submit Quote on new RFQ + Confirm Customer Appointment + Update 8-Stage CRM
    await logoutViaMenu(page);
    await loginViaModal(page, 'vendor@gawazinn.demo', 'DemoPass@2026');
    await page.goto(`${webUrl}/vendor?vendorId=vnd-el-rowad`, { waitUntil: 'networkidle' });
    await page.getByTestId('portal-tab-rfqs').waitFor({ state: 'visible' });
    await page.getByTestId('portal-tab-rfqs').click();
    await page.getByTestId(`portal-rfq-card-${newRfqId}`).waitFor({ state: 'visible' });

    await page.getByTestId(`portal-rfq-amount-${newRfqId}`).fill('275000');
    await page.getByTestId(`portal-rfq-deposit-${newRfqId}`).fill('45000');
    await page.getByTestId(`portal-rfq-duration-${newRfqId}`).fill('58 يوم عمل');
    await page.getByTestId(`portal-rfq-summary-${newRfqId}`).fill(
      'عرض متكامل شامل المعاينة الهندسية والتسليم على المفتاح خلال 58 يوم عمل.',
    );
    const quoteSubmitDone = page.waitForResponse(
      (res) => res.url().includes(`/rfq/${newRfqId}/quotes`) && res.status() === 201,
    );
    await page.getByTestId(`portal-rfq-submit-btn-${newRfqId}`).click();
    await quoteSubmitDone;

    await page.getByTestId(`portal-rfq-msg-input-${newRfqId}`).fill('تم استلام المواصفات وجاهز للمعاينة');
    const msgDone = page.waitForResponse(
      (res) => res.url().includes(`/rfq/${newRfqId}/messages`) && res.status() === 201,
    );
    await page.getByTestId(`portal-rfq-msg-send-${newRfqId}`).click();
    await msgDone;

    // Confirm Customer Slot Appointment
    await page.getByTestId('portal-tab-appointments').click();
    await page.getByTestId(`portal-apt-${createdAptId}`).waitFor({ state: 'visible' });
    await page.getByTestId(`portal-apt-note-${createdAptId}`).fill('موعد مؤكد مع مهندس الموقع');
    const confirmDone = page.waitForResponse(
      (res) => res.url().includes(`/appointments/${createdAptId}`) && res.status() === 200,
    );
    await page.getByTestId(`portal-apt-confirm-${createdAptId}`).click();
    await confirmDone;

    // 8-Stage CRM: Add manual lead + change stage + log activity
    await page.getByTestId('portal-tab-crm').click();
    await page.getByTestId('portal-crm-panel').waitFor({ state: 'visible' });
    await page.getByTestId('crm-new-name').fill('أ. طارق حسن');
    await page.getByTestId('crm-new-phone').fill('01022334455');
    await page.getByTestId('crm-new-title').fill('تجديد تشطيب ريسبشن 80م');
    await page.getByTestId('crm-new-value').fill('115000');
    const addLeadDone = page.waitForResponse(
      (res) => res.url().includes('/vendor-portal/crm/leads') && res.status() === 201,
    );
    await page.getByTestId('crm-new-submit').click();
    const leadRes = await addLeadDone;
    const leadJson = (await leadRes.json()) as { data: { lead: { id: string } } };
    const manualLeadId = leadJson.data.lead.id;
    await page.getByTestId(`crm-lead-card-${manualLeadId}`).waitFor({ state: 'visible' });

    const stagePatchDone = page.waitForResponse(
      (res) => res.url().includes(`/crm/leads/${manualLeadId}`) && res.status() === 200,
    );
    await page.getByTestId(`crm-lead-stage-${manualLeadId}`).selectOption('negotiation');
    await stagePatchDone;

    await page.getByTestId(`crm-lead-activity-input-${manualLeadId}`).fill('مكالمة متابعة وتحديد موعد المقايسة');
    const actDone = page.waitForResponse(
      (res) => res.url().includes(`/crm/leads/${manualLeadId}/activities`) && res.status() === 201,
    );
    await page.getByTestId(`crm-lead-activity-btn-${manualLeadId}`).click();
    await actDone;
    await assertNoHorizontalOverflow(page, 'desktop /vendor CRM');

    // 4. Logout -> Login back as Customer -> Accept Vendor Quote on /rfq -> Verify Synced Expense on /my/budget!
    await logoutViaMenu(page);
    await loginViaModal(page, 'karim@gawazinn.demo', 'DemoPass@2026');
    await page.goto(`${webUrl}/rfq`, { waitUntil: 'networkidle' });
    await page.getByTestId(`rfq-card-${newRfqId}`).waitFor({ state: 'visible' });

    // Accept the 275,000 EGP quote inside the newly created RFQ card
    const acceptBtn = page
      .getByTestId(`rfq-card-${newRfqId}`)
      .locator('[data-testid^="rfq-accept-quote-"]')
      .first();
    const acceptDone = page.waitForResponse(
      (res) => res.url().includes(`/rfq/${newRfqId}/quotes/`) && res.url().includes('/decide') && res.status() === 200,
    );
    await acceptBtn.click();
    await acceptDone;

    await page.getByTestId(`rfq-budget-linked-link-${newRfqId}`).waitFor({ state: 'visible' });
    await page.getByTestId(`rfq-budget-linked-link-${newRfqId}`).click();
    await page.waitForURL('**/my/budget');
    await page.getByTestId('budget-total-limit').waitFor({ state: 'visible' });
    const budgetText = await page.locator('main').innerText();
    assert.ok(budgetText.includes('275,000') || budgetText.includes('275000'), 'Budget Manager did not reflect synced 275,000 EGP RFQ contract');

    // Language toggle check on /rfq in EN mode
    await page.goto(`${webUrl}/rfq`, { waitUntil: 'networkidle' });
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.dir), 'ltr');
    await assertNoHorizontalOverflow(page, 'desktop /rfq LTR');
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.dir), 'rtl');

    // 5. Mobile 375px RTL overflow & usability audit across Stage 8 pages
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mPage = await mobileContext.newPage();
    mPage.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`mobile console.error: ${msg.text()}`);
    });
    mPage.on('pageerror', (err) => {
      errors.push(`mobile pageerror: ${err.message}`);
    });
    mPage.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        errors.push(`mobile HTTP ${res.status()} on ${res.url()}`);
      }
    });

    await mPage.goto(`${webUrl}/vendors/el-rowad-contracting`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mPage);
    await assertNoHorizontalOverflow(mPage, 'mobile /vendors/el-rowad-contracting');

    await loginViaModal(mPage, 'karim@gawazinn.demo', 'DemoPass@2026');
    for (const r of ['/rfq', '/rfq/new', '/rfq?tab=appointments']) {
      await mPage.goto(`${webUrl}${r}`, { waitUntil: 'networkidle' });
      await mPage.getByTestId('rfq-page-heading').waitFor({ state: 'visible' });
      await assertNoHorizontalOverflow(mPage, `mobile ${r}`);
    }

    await logoutViaMenu(mPage);
    await loginViaModal(mPage, 'vendor@gawazinn.demo', 'DemoPass@2026');
    await mPage.goto(`${webUrl}/vendor`, { waitUntil: 'networkidle' });
    for (const tab of ['portal-tab-rfqs', 'portal-tab-appointments', 'portal-tab-crm']) {
      await mPage.getByTestId(tab).click();
      await assertNoHorizontalOverflow(mPage, `mobile /vendor ${tab}`);
    }

    assert.equal(errors.length, 0, `Stage 8 E2E captured errors:\n${errors.join('\n')}`);
    console.log('Stage 8 E2E Chrome verification PASSED (Desktop AR/EN + Mobile 375px RTL, 0 errors).');
  } catch (err) {
    if (errors.length > 0) {
      console.error('Captured browser/HTTP errors before failure:\n' + errors.join('\n'));
    }
    throw err;
  } finally {
    if (browser) await browser.close();
    webProc.kill('SIGTERM');
    await new Promise<void>((resolve) => apiServer.close(() => resolve()));
    db.close();
    for (const ext of ['', '-wal', '-shm']) {
      const file = TEMP_DB_PATH + ext;
      if (fs.existsSync(file)) fs.rmSync(file, { force: true });
    }
  }
}

void main();

