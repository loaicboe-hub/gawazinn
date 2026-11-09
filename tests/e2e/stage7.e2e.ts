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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage7.db');
const E2E_SECRET = 'e2e-stage7-verification-secret';

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
  await page.getByTestId('header-login-btn').click();
  await page.getByTestId('auth-identifier-input').fill(identifier);
  await page.getByTestId('auth-password-input').fill(password);
  const done = page.waitForResponse(
    (res) => res.url().includes('/api/v1/auth/login') && res.status() === 200,
  );
  await page.getByTestId('auth-submit-btn').click();
  await done;
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
    throw new Error('No Chromium/Chrome executable found for Stage 7 E2E tests.');
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
      appOrigin: 'http://127.0.0.1:4177',
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
    [viteEntry, 'preview', '--port', '4177', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

  const webUrl = 'http://127.0.0.1:4177';
  let browser: Browser | null = null;

  try {
    await waitForUrl(webUrl);
    browser = await chromium.launch({
      executablePath: CHROME_CANDIDATES[0],
      headless: true,
    });

    // 1. Desktop (1440x900): Public Vendors Directory, Honest Zero-Rating -> Customer Review -> Local Location+Category -> Vendor Portal Commercial Upgrade (Unverified Stays Unverified!) -> Admin Audit Verification Upgrade
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    const errors: string[] = [];
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

    await page.goto(webUrl, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);

    // Open Vendors Directory from SplashHome discovery link
    await page.getByTestId('home-discovery-vendors').click();
    await page.getByTestId('vendors-directory-grid').waitFor({ state: 'visible' });
    const initialCards = await page.locator('[data-testid^="vendor-card-"]').count();
    assert.equal(initialCards, 18, `Expected 18 seeded vendors, got ${initialCards}`);
    await assertNoHorizontalOverflow(page, 'Desktop /vendors');

    // Filter by category 'turnkey_finishing' -> Buyer Checklist box appears
    await page.getByTestId('vendor-category-select').selectOption('turnkey_finishing');
    await page.getByTestId('vendor-category-checklist-card').waitFor({ state: 'visible' });
    await page.getByTestId('vendor-open-el-rowad-contracting').click();

    // Vendor Profile opens cleanly with honest 0-review badge
    await page.getByTestId('vendor-profile-heading').waitFor({ state: 'visible' });
    await page.getByTestId('honest-rating-empty').first().waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop /vendors/el-rowad-contracting');

    // Customer login & submit real review
    await loginViaModal(page, 'karim@gawazinn.demo', 'DemoPass@2026');
    await page.getByTestId('vendor-review-form').waitFor({ state: 'visible' });
    await page.getByTestId('review-rating-select').selectOption('5');
    await page.getByTestId('review-title-input').fill('التزام ممتاز بالتوقيت والتشطيب');
    await page
      .getByTestId('review-comment-input')
      .fill('تم فحص بند السباكة والكهرباء بمطابقة تامة لمعايير الجدول الهندسي.');
    const reviewSaved = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/vendors/el-rowad-contracting/reviews') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('review-submit-btn').click();
    await reviewSaved;

    // Rating updates live from empty -> 5.0 (1) and survives reload
    await page.getByTestId('honest-rating-value').first().waitFor({ state: 'visible' });
    await page.reload({ waitUntil: 'networkidle' });
    const ratingText = await page.getByTestId('honest-rating-value').first().textContent();
    assert.ok(ratingText?.includes('5.0'), `Expected 5.0 honest rating after reload, got ${ratingText}`);

    // Local Discovery SEO Page: /locations/cairo/turnkey_finishing
    await page.goto(`${webUrl}/locations/cairo/turnkey_finishing`, { waitUntil: 'networkidle' });
    await page.getByTestId('local-guide-heading').waitFor({ state: 'visible' });
    await page.getByTestId('local-category-checklist').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop /locations/cairo/turnkey_finishing');

    // Logout customer -> login as Vendor Owner -> open Vendor Portal for unregistered vnd-baytk-care
    await logoutViaMenu(page);
    await loginViaModal(page, 'vendor@gawazinn.demo', 'DemoPass@2026');

    await page.goto(`${webUrl}/vendor?vendorId=vnd-baytk-care`, { waitUntil: 'networkidle' });
    await page.getByTestId('verif-badge-registered').first().waitFor({ state: 'visible' });
    assert.equal(
      (await page.getByTestId('portal-quota-promos').textContent())?.trim(),
      '0 / 0',
      'Expected Free plan to start with 0/0 promotion quota',
    );

    // Switch commercial plan to Professional -> unlocks promos & logs billing, DOES NOT grant verification!
    await page.getByTestId('portal-tab-billing').click();
    const subDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/vendor-portal/subscription') && res.status() === 200,
    );
    await page.getByTestId('portal-select-plan-professional').click();
    await subDone;
    await page.getByTestId('portal-billing-ledger').waitFor({ state: 'visible' });
    await page.getByTestId('verif-badge-registered').first().waitFor({ state: 'visible' });

    // Create a promotion under newly unlocked Professional tier
    await page.getByTestId('portal-tab-promotions').click();
    await page.getByTestId('portal-promo-title-ar').fill('عرض فحص الشقة الشامل');
    await page.getByTestId('portal-promo-title-en').fill('Full Home Care Checkup Offer');
    await page
      .getByTestId('portal-promo-desc-ar')
      .fill('فحص جميع التكييفات والسباكة بخصم خاص لعملاء جواز إن.');
    await page
      .getByTestId('portal-promo-desc-en')
      .fill('Complete pre-summer AC and plumbing diagnostic bundle for couples.');
    const promoDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/vendor-portal/promotions') && res.status() === 201,
    );
    await page.getByTestId('portal-add-promo-btn').click();
    await promoDone;
    await assertNoHorizontalOverflow(page, 'Desktop /vendor Portal');

    // Logout vendor -> login as Admin -> audit & verify vnd-baytk-care to 'verified'
    await logoutViaMenu(page);
    await loginViaModal(page, 'admin@gawazinn.demo', 'AdminPass@2026');
    await page.goto(`${webUrl}/admin`, { waitUntil: 'networkidle' });
    await page.getByTestId('admin-tab-vendors').click();
    await page.getByTestId('admin-vendors-panel').waitFor({ state: 'visible' });

    await page
      .getByTestId('admin-verify-status-baytk-home-maintenance-ac-care')
      .selectOption('verified');
    await page
      .getByTestId('admin-verify-notes-baytk-home-maintenance-ac-care')
      .fill('تم فحص الأوراق القانونية واعتماد التوثيق الرسمي');
    const verifyDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/vendors/vnd-baytk-care/verify') && res.status() === 200,
    );
    await page.getByTestId('admin-verify-save-baytk-home-maintenance-ac-care').click();
    await verifyDone;

    // Verify public profile reflects Admin audit badge while preserving Professional commercial badge
    await page.goto(`${webUrl}/vendors/baytk-home-maintenance-ac-care`, {
      waitUntil: 'networkidle',
    });
    await page.getByTestId('verif-badge-verified').first().waitFor({ state: 'visible' });
    await page.getByTestId('commercial-badge-professional').first().waitFor({ state: 'visible' });

    // Language toggle check (English LTR) on /vendors
    await page.goto(`${webUrl}/vendors`, { waitUntil: 'networkidle' });
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(250);
    await assertNoHorizontalOverflow(page, 'Desktop EN LTR /vendors');

    assert.equal(errors.length, 0, `Stage 7 Desktop errors:\n${errors.join('\n')}`);
    await context.close();

    // 2. Mobile Viewport (375x812 RTL) Zero Horizontal Overflow Audit
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await mobileContext.newPage();
    const mobileErrors: string[] = [];
    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') mobileErrors.push(`mobile console.error: ${msg.text()}`);
    });
    mobilePage.on('pageerror', (err) => {
      mobileErrors.push(`mobile pageerror: ${err.message}`);
    });
    mobilePage.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        mobileErrors.push(`mobile HTTP ${res.status()} on ${res.url()}`);
      }
    });

    await mobilePage.goto(`${webUrl}/vendors`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mobilePage);
    await assertNoHorizontalOverflow(mobilePage, 'Mobile 375px /vendors');

    await mobilePage.goto(`${webUrl}/vendors/el-rowad-contracting`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile 375px /vendors/el-rowad-contracting');

    await mobilePage.goto(`${webUrl}/locations/cairo/turnkey_finishing`, {
      waitUntil: 'networkidle',
    });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile 375px /locations/cairo/turnkey_finishing');

    await mobilePage.goto(`${webUrl}/vendor`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile 375px /vendor');

    assert.equal(mobileErrors.length, 0, `Stage 7 Mobile errors:\n${mobileErrors.join('\n')}`);
    await mobileContext.close();

    console.log('✅ Stage 7 headless Chrome E2E verification passed (Desktop AR/EN + Mobile 375px RTL).');
  } finally {
    if (browser) await browser.close().catch(() => {});
    webProc.kill();
    apiServer.close();
    db.close();
    for (const ext of ['', '-wal', '-shm']) {
      const file = TEMP_DB_PATH + ext;
      if (fs.existsSync(file)) fs.rmSync(file, { force: true });
    }
  }
}

void main();
