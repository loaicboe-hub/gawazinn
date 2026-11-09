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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage10.db');
const E2E_SECRET = 'e2e-stage10-ai-room-wedding-secret';

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
    throw new Error('No Chromium/Chrome executable found for Stage 10 E2E tests.');
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
      appOrigin: 'http://127.0.0.1:4180',
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
    [viteEntry, 'preview', '--port', '4180', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

  const webUrl = 'http://127.0.0.1:4180';
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

    // 1. Guest uses /assistant starter prompt (120m² finishing + catalog) -> sees live calculator & clickable citations
    await page.goto(`${webUrl}/assistant`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('ai-assistant-heading').waitFor({ state: 'visible' });
    const robotsPub = await page.locator('meta[name="robots"]').getAttribute('content');
    assert.equal(robotsPub, 'index, follow');

    const aiGuestDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/assistant/ask') && res.status() === 200,
    );
    await page.getByTestId('ai-starter-prompt-finish-120').click();
    await aiGuestDone;
    await page.getByTestId('ai-message-assistant').waitFor({ state: 'visible' });
    await page.getByTestId('ai-calc-card-finishing-cost').waitFor({ state: 'visible' });
    assert.equal(await page.getByTestId('ai-personal-context-badge').count(), 0);
    await assertNoHorizontalOverflow(page, 'desktop /assistant guest');

    // 2. Karim logs in -> asks personal budget analysis on /assistant -> private context active
    await loginViaModal(page, 'karim@gawazinn.demo', 'DemoPass@2026');
    const aiPersonalDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/assistant/ask') && res.status() === 200,
    );
    await page.getByTestId('ai-starter-prompt-my-budget').click();
    await aiPersonalDone;
    await page.getByTestId('ai-personal-context-badge').waitFor({ state: 'visible' });

    // 3. Karim visits /room-designer -> creates bedroom board & adds DB product -> cost updates live
    await page.goto(`${webUrl}/room-designer`, { waitUntil: 'networkidle' });
    await page.getByTestId('room-designer-heading').waitFor({ state: 'visible' });
    await page.getByTestId('room-designer-canvas').waitFor({ state: 'visible' });

    await page.getByTestId('room-open-create-btn').click();
    await page.getByTestId('room-create-form').waitFor({ state: 'visible' });
    await page.getByTestId('room-title-input').fill('غرفة النوم الرئيسية E2E');
    const createBoardDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/room-studio/moodboards') && res.status() === 201,
    );
    await page.getByTestId('room-create-submit').click();
    await createBoardDone;

    // Add catalog product onto the new 2D floor plan canvas
    const addItemDone = page.waitForResponse(
      (res) => res.url().includes('/room-studio/moodboards/') && res.url().endsWith('/items') && res.status() === 201,
    );
    await page.getByTestId('room-add-item-submit').click();
    await addItemDone;
    const costText = await page.getByTestId('room-total-cost').innerText();
    assert.ok(!costText.startsWith('0 '), `Expected live DB product cost > 0 EGP, got "${costText}"`);
    await assertNoHorizontalOverflow(page, 'desktop /room-designer');

    // 4. Karim inspects /wedding-day, copies GI-KARIM-102 status ('pending'), then logs out
    await page.goto(`${webUrl}/wedding-day`, { waitUntil: 'networkidle' });
    await page.getByTestId('wedding-day-heading').waitFor({ state: 'visible' });
    const robotsPriv = await page.locator('meta[name="robots"]').getAttribute('content');
    assert.equal(robotsPriv, 'noindex, nofollow');
    await page.getByTestId('wedding-guest-row-wg-karim-2').waitFor({ state: 'visible' });
    const initialConfirmed = Number(await page.getByTestId('kpi-confirmed-headcount').innerText());
    const initialReserved = (await page.getByTestId('kpi-reserved-gifts').innerText()).trim();
    await assertNoHorizontalOverflow(page, 'desktop /wedding-day');

    // Also test timeline & table tabs desktop rendering
    await page.getByTestId('wedding-tab-seating').click();
    await page.getByTestId('seating-table-card-tbl-karim-vip').waitFor({ state: 'visible' });
    await page.getByTestId('wedding-tab-timeline').click();
    await page.getByTestId('add-timeline-form').waitFor({ state: 'visible' });

    await logoutViaMenu(page);

    // 5. Public Guest visits /rsvp/GI-KARIM-102 (unauthenticated!) -> confirms RSVP & reserves gift-karim-2
    await page.goto(`${webUrl}/rsvp/GI-KARIM-102`, { waitUntil: 'networkidle' });
    await page.getByTestId('rsvp-guest-heading').waitFor({ state: 'visible' });
    const rsvpRobots = await page.locator('meta[name="robots"]').getAttribute('content');
    assert.equal(rsvpRobots, 'noindex, nofollow');

    await page.getByTestId('rsvp-choice-confirmed').click();
    await page.getByTestId('rsvp-attending-select').selectOption('2');
    await page.getByTestId('rsvp-meal-select').selectOption('vegetarian');
    await page.getByTestId('rsvp-notes-input').fill('ألف مبروك لكريم ونهى — E2E');
    const rsvpDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/rsvp/GI-KARIM-102') && res.status() === 200,
    );
    await page.getByTestId('rsvp-submit-btn').click();
    await rsvpDone;
    await page.getByTestId('rsvp-success-banner').waitFor({ state: 'visible' });

    const giftDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/rsvp/GI-KARIM-102/reserve-gift') && res.status() === 200,
    );
    await page.getByTestId('reserve-gift-btn-gift-karim-2').click();
    await giftDone;
    await page.getByTestId('reserved-gift-badge-gift-karim-2').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'desktop /rsvp/GI-KARIM-102');

    // 6. Karim logs back in -> sees confirmed headcount & reserved gift count updated!
    await loginViaModal(page, 'karim@gawazinn.demo', 'DemoPass@2026');
    await page.goto(`${webUrl}/wedding-day`, { waitUntil: 'networkidle' });
    await page.getByTestId('kpi-confirmed-headcount').waitFor({ state: 'visible' });
    const afterConfirmed = Number(await page.getByTestId('kpi-confirmed-headcount').innerText());
    const afterReserved = (await page.getByTestId('kpi-reserved-gifts').innerText()).trim();
    assert.ok(afterConfirmed > initialConfirmed, `Expected confirmed headcount > ${initialConfirmed}, got ${afterConfirmed}`);
    assert.notEqual(afterReserved, initialReserved, `Expected reserved gifts count to increment from ${initialReserved}`);

    // Language switch check (EN LTR & back to AR RTL) on /room-designer
    await page.goto(`${webUrl}/room-designer`, { waitUntil: 'networkidle' });
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.dir), 'ltr');
    await assertNoHorizontalOverflow(page, 'desktop /room-designer LTR');
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.dir), 'rtl');

    // 7. Mobile 375px RTL checks across all Stage 10 routes
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

    await mPage.goto(`${webUrl}/assistant`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mPage);
    await mPage.getByTestId('ai-assistant-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /assistant');

    await mPage.goto(`${webUrl}/rsvp/GI-KARIM-102`, { waitUntil: 'networkidle' });
    await mPage.getByTestId('rsvp-guest-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /rsvp/GI-KARIM-102');

    await loginViaModal(mPage, 'karim@gawazinn.demo', 'DemoPass@2026');
    await mPage.goto(`${webUrl}/room-designer`, { waitUntil: 'networkidle' });
    await mPage.getByTestId('room-designer-canvas').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /room-designer');

    await mPage.goto(`${webUrl}/wedding-day`, { waitUntil: 'networkidle' });
    await mPage.getByTestId('wedding-day-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /wedding-day');

    assert.equal(errors.length, 0, `Stage 10 E2E captured errors:\n${errors.join('\n')}`);
    console.log('Stage 10 E2E Chrome verification PASSED (Desktop AR/EN + Mobile 375px RTL, 0 errors).');
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

