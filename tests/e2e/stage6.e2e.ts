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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage6.db');
const E2E_SECRET = 'e2e-stage6-verification-secret';

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

async function main() {
  if (CHROME_CANDIDATES.length === 0) {
    throw new Error('No Chromium/Chrome executable found for Stage 6 E2E tests.');
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
      appOrigin: 'http://127.0.0.1:4176',
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
    [viteEntry, 'preview', '--port', '4176', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

  const webUrl = 'http://127.0.0.1:4176';
  let browser: Browser | null = null;

  try {
    await waitForUrl(webUrl);
    browser = await chromium.launch({
      executablePath: CHROME_CANDIDATES[0],
      headless: true,
    });

    // 1. Desktop (1440x900) Guest Encyclopedia -> Multi-Compare Matrix -> Product Detail Chart & Offers -> Karim Login -> Price Alert & Multi-List Baskets
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

    // Navigate to Product Encyclopedia from homepage discovery badge
    await page.getByTestId('home-discovery-products').click();
    await page.getByTestId('product-encyclopedia-grid').waitFor({ state: 'visible' });
    const cardCount = await page.locator('[data-testid^="encyclopedia-product-"]').count();
    assert.equal(cardCount, 19, `Expected 19 Stage 6 products in encyclopedia, got ${cardCount}`);
    await assertNoHorizontalOverflow(page, 'Desktop /products');

    // Toggle 2 products into Compare Dock -> Open Matrix
    await page.getByTestId('compare-toggle-groom-p1').click();
    await page.getByTestId('compare-toggle-groom-p7').click();
    await page.getByTestId('floating-compare-dock').waitFor({ state: 'visible' });
    await page.getByTestId('floating-compare-now-btn').click();

    await page.getByTestId('product-compare-matrix').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop /products/compare');

    // Navigate to Product Detail Page -> inspect SVG chart & gray-market offers table
    await page.goto(`${webUrl}/products/sharp-450l-inverter-fridge`, { waitUntil: 'networkidle' });
    await page.getByTestId('price-history-chart').waitFor({ state: 'visible' });
    await page.getByTestId('merchant-offers-table').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop /products/sharp-450l-inverter-fridge');

    // Sign in via header to set Price Alert + manage Shopping Baskets
    await page.getByTestId('header-login-btn').click();
    await page.getByTestId('auth-identifier-input').fill('karim@gawazinn.demo');
    await page.getByTestId('auth-password-input').fill('DemoPass@2026');
    const listsHydrated = page.waitForResponse(
      (res) => res.url().includes('/api/v1/shopping-lists') && res.status() === 200,
    );
    await page.getByTestId('auth-submit-btn').click();
    await listsHydrated;

    // Update price alert target on Sharp fridge
    await page.getByTestId('price-alert-target-input').fill('35200');
    const alertSaveDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/price-alerts') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('save-price-alert-btn').click();
    await alertSaveDone;
    await page.getByTestId('product-alert-status-badge').waitFor({ state: 'visible' });

    // Open Multi-List Shopping Baskets, create a new basket & add an item -> verify reload persistence
    await page.goto(`${webUrl}/my/shopping-lists`, { waitUntil: 'networkidle' });
    await page.getByTestId('shopping-lists-sidebar').waitFor({ state: 'visible' });

    await page.getByTestId('new-list-title-ar').fill('سلة مستلزمات الشقة النهائية');
    await page.getByTestId('new-list-title-en').fill('Final Move-In Basket');
    await page.getByTestId('new-list-shared-checkbox').check();
    const listCreated = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/shopping-lists') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('create-shopping-list-submit').click();
    await listCreated;

    await page.getByTestId('basket-item-title-input').fill('خلاط مياه مطبخ مودرن');
    const itemAdded = page.waitForResponse(
      (res) =>
        res.url().includes('/items') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('basket-add-item-submit').click();
    await itemAdded;

    await page.reload({ waitUntil: 'networkidle' });
    const sidebarText = await page.getByTestId('shopping-lists-sidebar').textContent();
    assert.ok(
      sidebarText?.includes('سلة مستلزمات الشقة النهائية'),
      'Expected newly created shopping basket to persist across reload',
    );
    await assertNoHorizontalOverflow(page, 'Desktop RTL /my/shopping-lists');

    // Switch to English (LTR) & confirm /products + /my/shopping-lists remain overflow-free
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(250);
    await assertNoHorizontalOverflow(page, 'Desktop LTR /my/shopping-lists');

    assert.equal(errors.length, 0, `Stage 6 Desktop errors:\n${errors.join('\n')}`);
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

    await mobilePage.goto(`${webUrl}/products`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mobilePage);
    await mobilePage.getByTestId('compare-toggle-groom-p1').click();
    await mobilePage.getByTestId('floating-compare-dock').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile 375px /products with Floating Dock');

    await mobilePage.goto(`${webUrl}/products/compare?ids=groom-p1,groom-p7`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile 375px /products/compare');

    await mobilePage.goto(`${webUrl}/products/sharp-450l-inverter-fridge`, { waitUntil: 'networkidle' });
    await assertNoHorizontalOverflow(mobilePage, 'Mobile 375px /products/sharp-450l-inverter-fridge');

    assert.equal(mobileErrors.length, 0, `Stage 6 Mobile errors:\n${mobileErrors.join('\n')}`);
    await mobileContext.close();

    console.log('✅ Stage 6 headless Chrome E2E verification passed (Desktop AR/EN + Mobile 375px RTL).');
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
