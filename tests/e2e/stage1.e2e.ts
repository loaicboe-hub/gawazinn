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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage1.db');
const E2E_SECRET = 'e2e-stage1-verification-secret';

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
          offenders.push(`${el.tagName}.${String(el.className).slice(0, 60)} [left=${Math.round(r.left)}, right=${Math.round(r.right)}, w=${Math.round(r.width)}]`);
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

async function main() {
  if (CHROME_CANDIDATES.length === 0) {
    throw new Error('No Chromium/Chrome executable found for headless E2E tests.');
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
      appOrigin: 'http://127.0.0.1:4173',
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
  const webProc: ChildProcess = spawn(process.execPath, [viteEntry, 'preview', '--port', '4173', '--strictPort'], {
    env: {
      ...process.env,
      VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
    },
    stdio: 'ignore',
    shell: false,
  });

  const webUrl = 'http://127.0.0.1:4173';
  let browser: Browser | null = null;

  try {
    await waitForUrl(webUrl);
    browser = await chromium.launch({
      executablePath: CHROME_CANDIDATES[0],
      headless: true,
    });

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const httpFailures: string[] = [];

    // ================= 1. DESKTOP (1440x900) FULL E2E FLOW =================
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopCtx.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[console.error] ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(`[pageerror] ${err.message}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        httpFailures.push(`[HTTP ${res.status()}] ${res.url()}`);
      }
    });

    // Home + Intro Splash + 2x2 grid check
    await page.goto(webUrl, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('home-card-finishing').waitFor({ state: 'visible' });
    await page.getByTestId('home-card-groom').waitFor({ state: 'visible' });
    await page.getByTestId('home-card-bride').waitFor({ state: 'visible' });
    await page.getByTestId('home-card-wedding').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop /');

    // Finishing Calculator + 4 Packages + Quote Prefill Sync
    await page.getByTestId('home-card-finishing').click();
    await page.waitForURL('**/finishing');
    await page.locator('#finishing-area-range').waitFor({ state: 'visible' });
    await page.locator('#finishing-area-range').evaluate((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, '160');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.getByTestId('open-finishing-quote-btn').click();
    await page.locator('#finishing-quote-title').waitFor({ state: 'visible' });
    const prefilledArea = await page.locator('form input[type="number"]').inputValue();
    assert.equal(prefilledArea, '160', 'Finishing quote modal must inherit calculator area (160)');
    await page.keyboard.press('Escape');

    // Groom Catalog + RTL Compare Bar
    await page.goto(`${webUrl}/groom`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('compare-toggle-groom-p1').click();
    await page.getByTestId('groom-compare-bar').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop /groom');

    // Bride Catalog + Checklist Persistence across Reload + Image Load Check
    await page.goto(`${webUrl}/bride`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const brideInitialPct = await page.getByTestId('bride-checklist-progress').textContent();
    await page.getByTestId('bride-check-chk-2').click();
    const brideNextPct = await page.getByTestId('bride-checklist-progress').textContent();
    assert.notEqual(brideInitialPct, brideNextPct, 'Bride checklist progress must advance');
    await page.reload({ waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const brideAfterReload = await page.getByTestId('bride-checklist-progress').textContent();
    assert.equal(brideAfterReload, brideNextPct, 'Bride checklist state must persist across reload');

    // Encyclopedia + Guide Detail + Local Discovery
    await page.goto(`${webUrl}/encyclopedia`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('article-card-complete-egyptian-apartment-finishing-sequence').locator('a').first().click();
    await page.waitForURL('**/guides/complete-egyptian-apartment-finishing-sequence');
    await page.locator('h1').waitFor({ state: 'visible' });

    await page.goto(`${webUrl}/locations/cairo`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.locator('h1').waitFor({ state: 'visible' });

    // Customer Portal anonymous state (must NOT auto-login!) + Real Auth
    await page.goto(`${webUrl}/portal`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('portal-signin-btn').click();
    await page.locator('#auth-modal-title').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: /كريم|Demo Customer/i }).click();
    await page.locator('h1:has-text("كريم")').waitFor({ state: 'visible' });

    // Customer cannot open Admin OS -> sees denied notice
    await page.goto(`${webUrl}/admin`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('admin-denied').waitFor({ state: 'visible' });

    // Log out customer and log in as Admin -> verify Admin OS + real DB KPI
    await page.getByTestId('user-menu-btn').click();
    await page.getByRole('button', { name: /تسجيل الخروج|Log Out/i }).click();
    await page.getByTestId('header-login-btn').waitFor({ state: 'visible' });
    await page.getByTestId('header-login-btn').click();
    await page.getByRole('button', { name: /دخول الإدارة|Demo Admin/i }).click();
    await page.goto(`${webUrl}/admin`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const kpiCount = (await page.getByTestId('admin-kpi-customers').textContent())?.trim();
    assert.equal(kpiCount, '2', 'Admin KPI must show actual active DB customer count (2), not hardcoded 1480');
    await page.getByTestId('admin-tab-cms').click();
    await page.getByTestId('admin-tab-audit').click();

    // Language toggle RTL -> LTR check
    await page.goto(`${webUrl}/`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('lang-switch-btn').click();
    const dirAttr = await page.evaluate(() => document.documentElement.dir);
    assert.equal(dirAttr, 'ltr', 'Language toggle must switch HTML dir to ltr');
    await assertNoHorizontalOverflow(page, 'Desktop LTR /');

    // Verify zero broken images currently rendered in DOM on key catalog views
    for (const imgRoute of ['/finishing', '/groom', '/bride', '/wedding', '/encyclopedia']) {
      await page.goto(`${webUrl}${imgRoute}`, { waitUntil: 'networkidle' });
      await dismissIntroIfPresent(page);
      const brokenImgs = await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const bad: string[] = [];
        for (const img of imgs) {
          img.loading = 'eager';
          img.scrollIntoView();
          if (!img.complete) {
            await new Promise((r) => setTimeout(r, 800));
          }
          if (img.complete && img.naturalWidth === 0) {
            bad.push(img.src);
          }
        }
        return bad;
      });
      assert.equal(brokenImgs.length, 0, `Broken images on ${imgRoute}: ${brokenImgs.join(', ')}`);
    }

    await desktopCtx.close();

    // ================= 2. MOBILE (375x812 RTL) VIEWPORT CHECKS =================
    const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mPage = await mobileCtx.newPage();

    mPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`[mobile console.error] ${msg.text()}`);
    });
    mPage.on('pageerror', (err) => {
      pageErrors.push(`[mobile pageerror] ${err.message}`);
    });
    mPage.on('response', (res) => {
      if (res.status() >= 400) httpFailures.push(`[mobile HTTP ${res.status()}] ${res.url()}`);
    });

    await mPage.goto(webUrl, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mPage);
    await assertNoHorizontalOverflow(mPage, 'Mobile RTL /');

    await mPage.goto(`${webUrl}/groom`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mPage);
    await mPage.getByTestId('compare-toggle-groom-p1').click();
    const compareBar = mPage.getByTestId('groom-compare-bar');
    await compareBar.waitFor({ state: 'visible' });
    const box = await compareBar.boundingBox();
    assert.ok(box, 'Sticky compare bar must have a bounding box on mobile RTL');
    assert.ok(
      box!.x >= -1 && box!.x + box!.width <= 376,
      `Sticky compare bar drifted off mobile viewport in RTL: x=${box!.x}, width=${box!.width}`,
    );
    await assertNoHorizontalOverflow(mPage, 'Mobile RTL /groom');

    await mPage.goto(`${webUrl}/finishing`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mPage);
    await assertNoHorizontalOverflow(mPage, 'Mobile RTL /finishing');

    await mPage.goto(`${webUrl}/discover`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mPage);
    await assertNoHorizontalOverflow(mPage, 'Mobile RTL /discover');

    await mobileCtx.close();

    assert.equal(consoleErrors.length, 0, `Unexpected console errors:\n${consoleErrors.join('\n')}`);
    assert.equal(pageErrors.length, 0, `Unexpected page errors:\n${pageErrors.join('\n')}`);
    assert.equal(httpFailures.length, 0, `Unexpected HTTP >= 400 responses:\n${httpFailures.join('\n')}`);

    console.log('✅ Stage 1 E2E Suite Passed: Desktop 1440px, Mobile RTL 375px, RBAC, SEO, Image Integrity & Zero Console Errors!');
  } finally {
    if (browser) await browser.close();
    if (webProc && !webProc.killed) {
      webProc.kill('SIGTERM');
    }
    apiServer.closeAllConnections?.();
    await new Promise<void>((resolve) => apiServer.close(() => resolve()));
    db.close();
    for (const ext of ['', '-wal', '-shm']) {
      const file = TEMP_DB_PATH + ext;
      if (fs.existsSync(file)) fs.rmSync(file, { force: true });
    }
  }
}

main().catch((err) => {
  console.error('❌ E2E Failure:', err);
  process.exit(1);
});

