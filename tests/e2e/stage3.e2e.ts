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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage3.db');
const E2E_SECRET = 'e2e-stage3-verification-secret';

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
    throw new Error('No Chromium/Chrome executable found for Stage 3 E2E tests.');
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
  const webProc: ChildProcess = spawn(
    process.execPath,
    [viteEntry, 'preview', '--port', '4173', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

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

    // ================= 1. DESKTOP (1440x900) STAGE 3 CALCULATORS & BUDGET FLOW =================
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopCtx.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`[console.error] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      pageErrors.push(`[pageerror] ${err.message}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) httpFailures.push(`[HTTP ${res.status()}] ${res.url()}`);
    });

    // 1. Calculators Hub -> 20 Smart Calculators + Filter + Search
    await page.goto(`${webUrl}/calculators`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('calculators-grid').waitFor({ state: 'visible' });
    const allCount = await page.locator('[data-testid^="calc-card-"]').count();
    assert.equal(allCount, 20, `Expected 20 calculator cards on /calculators, got ${allCount}`);
    await assertNoHorizontalOverflow(page, 'Desktop /calculators');

    await page.getByTestId('calc-filter-finishing_home').click();
    const finishingGroupCount = await page.locator('[data-testid^="calc-card-"]').count();
    assert.ok(finishingGroupCount >= 6 && finishingGroupCount < 20, 'Finishing filter must subset grid');
    await page.getByTestId('calc-filter-all').click();

    await page.getByTestId('calc-search-input').fill('الدهان');
    await page.getByTestId('calc-card-paint-quantities').waitFor({ state: 'visible' });
    await page.getByTestId('calc-search-input').fill('');

    // 2. Open finishing-cost calculator & verify dynamic live updates
    await page.getByTestId('calc-card-finishing-cost').click();
    await page.waitForURL('**/calculators/finishing-cost');
    const initResult = await page.getByTestId('calc-primary-result').textContent();
    await page.getByTestId('calc-input-areaSqm').fill('180');
    await page.getByTestId('calc-input-tier').selectOption('luxury');
    const updatedResult = await page.getByTestId('calc-primary-result').textContent();
    assert.notEqual(initResult, updatedResult, 'Changing finishing inputs must update primary output');
    await assertNoHorizontalOverflow(page, 'Desktop /calculators/finishing-cost');

    // 3. Long-term projections calculator (8-year horizon)
    await page.goto(`${webUrl}/calculators/long-term-projections`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('calc-input-horizonYears').fill('8');
    await page.getByTestId('calc-breakdown-list').waitFor({ state: 'visible' });

    // 4. Sign in as Karim -> Apply finishing-cost directly to Wedding Budget Manager
    await page.goto(`${webUrl}/calculators/finishing-cost`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('header-login-btn').click();
    await page.getByRole('button', { name: /كريم|Demo Customer/i }).click();
    await page.getByTestId('user-menu-btn').waitFor({ state: 'visible' });

    await page.getByTestId('calc-input-areaSqm').fill('165');
    const importDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/budget/import-from-calculator') && res.status() === 200,
    );
    await page.getByTestId('calc-save-to-budget-btn').click();
    await importDone;

    // 5. Open /my/budget -> Verify KPIs, Alerts, Sync, Add Expense + Overrun + Mark Paid + Reload Persistence
    await page.goto(`${webUrl}/my/budget`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('budget-total-limit').waitFor({ state: 'visible' });
    await page.getByTestId('budget-alerts-strip').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'Desktop /my/budget');

    const syncDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/budget/sync-transactions') && res.status() === 200,
    );
    await page.getByTestId('budget-sync-btn').click();
    await syncDone;

    // Add upcoming expense pushing Gold Shabka over cap
    await page.getByTestId('expense-category-select').selectOption('gold_shabka');
    await page.getByTestId('expense-title-input').fill('دفعة حجز الشبكة الذهبية');
    await page.getByTestId('expense-amount-input').fill('250000');
    await page.getByTestId('expense-status-select').selectOption('upcoming');

    const createExpDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/budget/expenses') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('expense-submit-btn').click();
    await createExpDone;

    await page.getByText('دفعة حجز الشبكة الذهبية').waitFor({ state: 'visible' });
    const markPaidBtn = page.locator('[data-testid^="mark-paid-btn-"]').first();
    const paidDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/budget/expenses/') &&
        res.request().method() === 'PATCH' &&
        res.status() === 200,
    );
    await markPaidBtn.click();
    await paidDone;

    // Reload and verify database persistence
    await page.reload({ waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByText('دفعة حجز الشبكة الذهبية').waitFor({ state: 'visible' });

    await desktopCtx.close();

    // ================= 2. MOBILE (375x812 RTL) OVERFLOW CHECKS =================
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

    for (const mobRoute of [
      '/calculators',
      '/calculators/finishing-cost',
      '/calculators/long-term-projections',
      '/my/budget',
    ]) {
      await mPage.goto(`${webUrl}${mobRoute}`, { waitUntil: 'networkidle' });
      await dismissIntroIfPresent(mPage);
      await assertNoHorizontalOverflow(mPage, `Mobile RTL ${mobRoute}`);
    }

    await mobileCtx.close();

    assert.equal(consoleErrors.length, 0, `Unexpected console errors:\n${consoleErrors.join('\n')}`);
    assert.equal(pageErrors.length, 0, `Unexpected page errors:\n${pageErrors.join('\n')}`);
    assert.equal(httpFailures.length, 0, `Unexpected HTTP >= 400 responses:\n${httpFailures.join('\n')}`);

    console.log('✅ Stage 3 E2E Suite Passed: 20 Smart Calculators, Budget Linking, Alerts, Sync & Mobile RTL!');
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
  console.error('❌ Stage 3 E2E Failure:', err);
  process.exit(1);
});
