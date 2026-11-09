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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage4.db');
const E2E_SECRET = 'e2e-stage4-verification-secret';

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
    throw new Error('No Chromium/Chrome executable found for Stage 4 E2E tests.');
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
      appOrigin: 'http://127.0.0.1:4174',
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
    [viteEntry, 'preview', '--port', '4174', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

  const webUrl = 'http://127.0.0.1:4174';
  let browser: Browser | null = null;

  try {
    await waitForUrl(webUrl);
    browser = await chromium.launch({
      executablePath: CHROME_CANDIDATES[0],
      headless: true,
    });

    // 1. Desktop (1440x900) Guest -> What-If Simulator -> Academy -> Karim Login -> Future Fund Deposit & Reload Persistence
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

    // Home -> Early Start discovery pill
    await page.getByTestId('home-discovery-early-start').click();
    await page.getByTestId('early-start-hero-signin').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop Guest /early-start');

    // Interactive What-If Simulator tab
    await page.getByTestId('early-start-tab-simulator').click();
    await page.getByTestId('whatif-comparison-table').waitFor({ state: 'visible' });
    await page.getByTestId('whatif-row-save_1000').waitFor({ state: 'visible' });
    await page.getByTestId('whatif-row-save_3000').waitFor({ state: 'visible' });
    await page.getByTestId('sim-monthly-input').fill('8000');
    await assertNoHorizontalOverflow(page, 'Desktop What-If Simulator');

    // Academy tab -> 10 modules visible
    await page.getByTestId('early-start-tab-academy').click();
    await page.getByTestId('academy-lessons-list').waitFor({ state: 'visible' });
    const lessonCount = await page.locator('[data-testid^="academy-lesson-"]').count();
    assert.equal(lessonCount, 10, `Expected 10 Academy modules, got ${lessonCount}`);

    // Sign in as Karim directly via Hero CTA -> fills demo customer credentials
    await page.getByTestId('early-start-hero-signin').click();
    await page.getByTestId('auth-identifier-input').fill('karim@gawazinn.demo');
    await page.getByTestId('auth-password-input').fill('DemoPass@2026');
    const loginDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/early-start/overview') && res.status() === 200,
    );
    await page.getByTestId('auth-submit-btn').click();
    await loginDone;
    await page.getByTestId('early-start-total-saved').waitFor({ state: 'visible' });

    // Adjust timeline preset to 7y and save profile adjustment
    await page.getByTestId('early-start-tab-dashboard').click();
    await page.getByTestId('timeframe-preset-7y').click();
    const profileSaveDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/early-start/profile') &&
        res.request().method() === 'PUT' &&
        res.status() === 200,
    );
    await page.getByTestId('early-profile-save-btn').click();
    await profileSaveDone;
    await assertNoHorizontalOverflow(page, 'Desktop Signed-In /early-start');

    // Open My Future Fund tab -> create Appliances goal & log deposit
    await page.getByTestId('early-start-tab-fund').click();
    await page.getByTestId('toggle-add-goal-btn').click();
    await page.getByTestId('new-goal-type-select').selectOption('appliances');
    await page.getByTestId('new-goal-title-input').fill('صندوق الأجهزة الذكية');
    await page.getByTestId('new-goal-target-input').fill('110000');
    const goalCreateDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/early-start/goals') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('create-goal-submit-btn').click();
    await goalCreateDone;
    await page.getByTestId('savings-goal-card-appliances').waitFor({ state: 'visible' });

    await page.getByTestId('goal-deposit-btn-appliances').click();
    await page.getByTestId('deposit-amount-input').fill('6500');
    await page.getByTestId('deposit-note-input').fill('إيداع بداية الأجهزة');
    const depositDone = page.waitForResponse(
      (res) =>
        res.url().includes('/contributions') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('deposit-submit-btn').click();
    await depositDone;

    // Reload /my/future-fund cleanly & confirm persistence from SQLite
    await page.goto(`${webUrl}/my/future-fund`, { waitUntil: 'networkidle' });
    await page.getByTestId('savings-goal-card-appliances').waitFor({ state: 'visible' });
    const appliancesText = await page.getByTestId('savings-goal-card-appliances').textContent();
    assert.ok(
      appliancesText && /6[,،]?500/.test(appliancesText),
      `Expected persisted 6,500 deposit on appliances card, got: ${appliancesText}`,
    );

    // Switch to English (LTR) & confirm clean header + zero overflow across Stage 4 views
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(250);
    await assertNoHorizontalOverflow(page, 'Desktop LTR /my/future-fund');

    await page.goto(`${webUrl}/early-start/academy`, { waitUntil: 'networkidle' });
    await page.getByTestId('academy-lessons-list').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop LTR /early-start/academy');

    assert.equal(
      errors.length,
      0,
      `Desktop Stage 4 E2E encountered errors:\n${errors.join('\n')}`,
    );
    await context.close();

    // 2. Mobile 375x812 RTL Check
    const mobContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobPage = await mobContext.newPage();
    const mobErrors: string[] = [];
    mobPage.on('console', (msg) => {
      if (msg.type() === 'error') mobErrors.push(`console.error: ${msg.text()}`);
    });
    mobPage.on('pageerror', (err) => {
      mobErrors.push(`pageerror: ${err.message}`);
    });
    mobPage.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        mobErrors.push(`HTTP ${res.status()} on ${res.url()}`);
      }
    });

    await mobPage.goto(`${webUrl}/early-start`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mobPage);
    await assertNoHorizontalOverflow(mobPage, 'Mobile 375px /early-start');

    await mobPage.getByTestId('early-start-tab-simulator').click();
    await mobPage.getByTestId('whatif-comparison-table').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mobPage, 'Mobile 375px What-If Simulator');

    assert.equal(
      mobErrors.length,
      0,
      `Mobile Stage 4 E2E encountered errors:\n${mobErrors.join('\n')}`,
    );
    await mobContext.close();

    console.log('✅ Stage 4 E2E (Desktop AR/EN + Mobile RTL) passed cleanly!');
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (webProc && !webProc.killed) webProc.kill();
    await new Promise<void>((resolve) => apiServer.close(() => resolve()));
    db.close();
    for (const ext of ['', '-wal', '-shm']) {
      const file = TEMP_DB_PATH + ext;
      if (fs.existsSync(file)) fs.rmSync(file, { force: true });
    }
  }
}

main().catch((err) => {
  console.error('❌ Stage 4 E2E Failed:', err);
  process.exit(1);
});

