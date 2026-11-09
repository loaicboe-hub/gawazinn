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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage11.db');
const E2E_SECRET = 'e2e-stage11-married-life-home-care-secret';

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

async function main() {
  if (CHROME_CANDIDATES.length === 0) {
    throw new Error('No Chromium/Chrome executable found for Stage 11 E2E tests.');
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
      appOrigin: 'http://127.0.0.1:4181',
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
    [viteEntry, 'preview', '--port', '4181', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

  const webUrl = 'http://127.0.0.1:4181';
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

    // 1. Guest visits public /newlyweds-guide -> verifies index, follow & toggles a checklist step
    await page.goto(`${webUrl}/newlyweds-guide`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('newlyweds-guide-heading').waitFor({ state: 'visible' });
    const guideRobots = await page.locator('meta[name="robots"]').getAttribute('content');
    assert.equal(guideRobots, 'index, follow');

    await page.getByTestId('track-step-m-1').locator('input').click();
    const progText = await page.getByTestId('newlyweds-progress-text').innerText();
    assert.ok(progText.startsWith('1 /'), `Expected progress to start with "1 /", got "${progText}"`);
    await assertNoHorizontalOverflow(page, 'desktop /newlyweds-guide');

    // 2. Guest visits public /home-care -> sees checklists & filters home maintenance partners
    await page.goto(`${webUrl}/home-care`, { waitUntil: 'networkidle' });
    await page.getByTestId('home-care-heading').waitFor({ state: 'visible' });
    const careRobots = await page.locator('meta[name="robots"]').getAttribute('content');
    assert.equal(careRobots, 'index, follow');
    await page.getByTestId('homecare-checklist-moving_logistics').waitFor({ state: 'visible' });
    await page.getByTestId('homecare-checklist-home_maintenance').waitFor({ state: 'visible' });
    await page.getByTestId('homecare-filter-home_maintenance').click();
    await page.getByTestId('homecare-vendor-baytk-home-maintenance-ac-care').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'desktop /home-care');

    // 3. Karim logs in -> visits /my/home-file -> noindex, nofollow + CRUD across Assets, Maintenance & Inventory
    await loginViaModal(page, 'karim@gawazinn.demo', 'DemoPass@2026');
    await page.goto(`${webUrl}/my/home-file`, { waitUntil: 'networkidle' });
    await page.getByTestId('home-file-heading').waitFor({ state: 'visible' });
    const privRobots = await page.locator('meta[name="robots"]').getAttribute('content');
    assert.equal(privRobots, 'noindex, nofollow');

    const initialAssets = Number(await page.getByTestId('kpi-total-assets').innerText());
    const initialOverdue = Number(await page.getByTestId('kpi-overdue-reminders').innerText());
    assert.ok(initialOverdue >= 1, `Expected initial overdue >= 1, got ${initialOverdue}`);

    // Add a new home asset
    await page.getByTestId('asset-room-input').fill('غرفة الطعام E2E');
    await page.getByTestId('asset-title-input').fill('كود دهان ورق حائط ديكوري');
    await page.getByTestId('asset-code-input').fill('Jotun 9918');
    const createAssetDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/home-care/assets') && res.status() === 201,
    );
    await page.getByTestId('create-home-asset-btn').click();
    await createAssetDone;
    const afterAssets = Number(await page.getByTestId('kpi-total-assets').innerText());
    assert.equal(afterAssets, initialAssets + 1);

    // Complete overdue reminder -> overdue KPI drops
    await page.getByTestId('home-file-tab-maintenance').click();
    await page.getByTestId('complete-reminder-btn-mrem-karim-1').waitFor({ state: 'visible' });
    const completeDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/home-care/reminders/mrem-karim-1/complete') && res.status() === 200,
    );
    await page.getByTestId('complete-reminder-btn-mrem-karim-1').click();
    await completeDone;
    const afterOverdue = Number(await page.getByTestId('kpi-overdue-reminders').innerText());
    assert.equal(afterOverdue, 0);

    // Add inventory item -> inventory value updates cleanly
    await page.getByTestId('home-file-tab-inventory').click();
    const initialInvText = await page.getByTestId('kpi-inventory-value').innerText();
    await page.getByTestId('inv-room-input').fill('المطبخ');
    await page.getByTestId('inv-name-input').fill('قلاية هوائية فيليبس E2E');
    await page.getByTestId('inv-brand-input').fill('Philips HD9270');
    await page.getByTestId('inv-price-input').fill('8500');
    const createInvDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/home-care/inventory') && res.status() === 201,
    );
    await page.getByTestId('create-inventory-btn').click();
    await createInvDone;
    const afterInvText = await page.getByTestId('kpi-inventory-value').innerText();
    assert.notEqual(afterInvText, initialInvText);

    // Check integrated Stage 5 Warranties & Document Vault tab
    await page.getByTestId('home-file-tab-warranties').click();
    await page.getByTestId('home-file-vault-section').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'desktop /my/home-file');

    // Language switch check (EN LTR & back to AR RTL)
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.dir), 'ltr');
    await assertNoHorizontalOverflow(page, 'desktop /my/home-file LTR');
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.dir), 'rtl');

    // 4. Mobile 375px RTL checks across all 3 Stage 11 routes
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

    await mPage.goto(`${webUrl}/newlyweds-guide`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mPage);
    await mPage.getByTestId('newlyweds-guide-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /newlyweds-guide');

    await mPage.goto(`${webUrl}/home-care`, { waitUntil: 'networkidle' });
    await mPage.getByTestId('home-care-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /home-care');

    await loginViaModal(mPage, 'karim@gawazinn.demo', 'DemoPass@2026');
    await mPage.goto(`${webUrl}/my/home-file`, { waitUntil: 'networkidle' });
    await mPage.getByTestId('home-file-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /my/home-file');

    assert.equal(errors.length, 0, `Stage 11 E2E captured errors:\n${errors.join('\n')}`);
    console.log('Stage 11 E2E Chrome verification PASSED (Desktop AR/EN + Mobile 375px RTL, 0 errors).');
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
