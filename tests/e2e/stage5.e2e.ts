import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import assert from 'node:assert/strict';
import { chromium, type Browser, type Page } from 'playwright-core';
import { openDatabase, runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { MY_GAWAZ_INN_MODULES } from '../../shared/journeyWorkspaceData';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter((p): p is string => Boolean(p && fs.existsSync(p)));

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage5.db');
const E2E_SECRET = 'e2e-stage5-verification-secret';

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
    throw new Error('No Chromium/Chrome executable found for Stage 5 E2E tests.');
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
      appOrigin: 'http://127.0.0.1:4175',
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
    [viteEntry, 'preview', '--port', '4175', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

  const webUrl = 'http://127.0.0.1:4175';
  let browser: Browser | null = null;

  try {
    await waitForUrl(webUrl);
    browser = await chromium.launch({
      executablePath: CHROME_CANDIDATES[0],
      headless: true,
    });

    // 1. Desktop (1440x900) Guest Onboarding -> Karim Login -> Lifecycle Transition -> Engagement -> Journey Calendar -> 17-Module Hub + Partner Invite -> Sara Accept
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

    // Guest explores 11-stage Onboarding
    await page.getByTestId('home-discovery-onboarding').click();
    await page.getByTestId('onboarding-signin-btn').waitFor({ state: 'visible' });
    const stageCardsCount = await page.locator('[data-testid^="stage-card-"]').count();
    assert.equal(stageCardsCount, 11, `Expected 11 lifecycle stage cards, got ${stageCardsCount}`);
    await assertNoHorizontalOverflow(page, 'Desktop Guest /onboarding');

    // Sign in as Karim
    await page.getByTestId('onboarding-signin-btn').click();
    await page.getByTestId('auth-identifier-input').fill('karim@gawazinn.demo');
    await page.getByTestId('auth-password-input').fill('DemoPass@2026');
    const hubHydrate = page.waitForResponse(
      (res) => res.url().includes('/api/v1/my/hub') && res.status() === 200,
    );
    await page.getByTestId('auth-submit-btn').click();
    await hubHydrate;

    // Transition lifecycle stage to planning_wedding + reload persistence
    await page.getByTestId('onboarding-transition-note-input').fill('تم حجز قاعة الفرح مبدئياً');
    const stageUpdateDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/onboarding/stage') &&
        res.request().method() === 'POST' &&
        res.status() === 200,
    );
    await page.getByTestId('select-stage-planning_wedding').click();
    await stageUpdateDone;

    await page.goto(`${webUrl}/onboarding`, { waitUntil: 'networkidle' });
    const activeStageBadge = await page.getByTestId('current-lifecycle-stage-badge').textContent();
    assert.ok(
      activeStageBadge && activeStageBadge.includes('8'),
      `Expected stage 8 active after reload, got: ${activeStageBadge}`,
    );

    // Module B: Engagement Planner save & add item
    await page.goto(`${webUrl}/engagement`, { waitUntil: 'networkidle' });
    await page.getByTestId('engagement-new-title-input').fill('صينية الشبكة والتزيين');
    const engAddDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/engagement/items') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('add-engagement-item-btn').click();
    await engAddDone;
    await assertNoHorizontalOverflow(page, 'Desktop /engagement');

    // Module I: Wedding Journey Planner -> List + Calendar Grid + Add Task
    await page.goto(`${webUrl}/my/journey`, { waitUntil: 'networkidle' });
    await page.getByTestId('journey-task-list').waitFor({ state: 'visible' });
    await page.getByTestId('journey-view-calendar-btn').click();
    await page.getByTestId('journey-calendar-grid').waitFor({ state: 'visible' });
    await page.getByTestId('journey-view-list-btn').click();

    await page.getByTestId('toggle-add-journey-task-btn').click();
    await page.getByTestId('journey-new-title-input').fill('معاينة دهانات الريسبشن');
    await page.getByTestId('journey-new-due-input').fill('2026-11-22');
    const jtCreateDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/journey/tasks') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('add-journey-task-submit-btn').click();
    await jtCreateDone;
    await assertNoHorizontalOverflow(page, 'Desktop /my/journey');

    // Module J: 17-Module My Gawaz Inn Command Center -> verify all 17 tabs render cleanly
    await page.goto(`${webUrl}/my/workspace`, { waitUntil: 'networkidle' });
    for (const mod of MY_GAWAZ_INN_MODULES) {
      await page.getByTestId(`hub-tab-${mod.key}`).click();
    }

    // Back to Workspace tab -> Karim invites Sara -> captures issued token
    await page.getByTestId('hub-tab-workspace').click();
    await page.getByTestId('invite-identifier-input').fill('sara@gawazinn.demo');
    const inviteSent = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/workspace/invite') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('send-workspace-invite-btn').click();
    await inviteSent;
    await page.getByTestId('generated-invite-token').waitFor({ state: 'visible' });

    // Switch to Documents tab & store shared document
    await page.getByTestId('hub-tab-documents').click();
    await page.getByTestId('doc-title-input').fill('ملف مقاسات مطبخ الزوجين');
    await page.getByTestId('doc-filename-input').fill('kitchen-layout.pdf');
    await page.getByTestId('doc-shared-checkbox').check();
    const docDone = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/my/documents') &&
        res.request().method() === 'POST' &&
        res.status() === 201,
    );
    await page.getByTestId('create-document-btn').click();
    await docDone;

    // Switch to English (LTR) & verify overflow-free layout
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(250);
    await assertNoHorizontalOverflow(page, 'Desktop LTR /my/workspace');

    assert.equal(
      errors.length,
      0,
      `Karim Stage 5 E2E encountered errors:\n${errors.join('\n')}`,
    );
    await context.close();

    // 2. Sara logs into fresh context -> sees Incoming Invite from Karim -> Accepts -> sees Shared Workspace + Shared Doc!
    const saraContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const saraPage = await saraContext.newPage();
    const saraErrors: string[] = [];
    saraPage.on('console', (msg) => {
      if (msg.type() === 'error') saraErrors.push(`console.error: ${msg.text()}`);
    });
    saraPage.on('pageerror', (err) => {
      saraErrors.push(`pageerror: ${err.message}`);
    });
    saraPage.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        saraErrors.push(`HTTP ${res.status()} on ${res.url()}`);
      }
    });

    await saraPage.goto(`${webUrl}/my/workspace`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(saraPage);
    await saraPage.getByTestId('hub-signin-btn').click();
    await saraPage.getByTestId('auth-identifier-input').fill('sara@gawazinn.demo');
    await saraPage.getByTestId('auth-password-input').fill('DemoPass@2026');
    const saraHubDone = saraPage.waitForResponse(
      (res) => res.url().includes('/api/v1/my/hub') && res.status() === 200,
    );
    await saraPage.getByTestId('auth-submit-btn').click();
    await saraHubDone;

    await saraPage.getByTestId('accept-invite-btn').waitFor({ state: 'visible' });
    const acceptDone = saraPage.waitForResponse(
      (res) =>
        res.url().includes('/accept') &&
        res.request().method() === 'POST' &&
        res.status() === 200,
    );
    await saraPage.getByTestId('accept-invite-btn').click();
    await acceptDone;

    // Reload and verify Sara is inside Shared Workspace and sees Karim's shared doc
    await saraPage.goto(`${webUrl}/my/workspace?tab=documents`, { waitUntil: 'networkidle' });
    const docsText = await saraPage.getByTestId('documents-list').textContent();
    assert.ok(
      docsText && docsText.includes('ملف مقاسات مطبخ الزوجين'),
      `Expected Sara to see Karim shared document after consent accept, got: ${docsText}`,
    );

    assert.equal(
      saraErrors.length,
      0,
      `Sara Stage 5 E2E encountered errors:\n${saraErrors.join('\n')}`,
    );
    await saraContext.close();

    // 3. Mobile 375x812 RTL Check across Stage 5 views
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

    for (const r of ['/onboarding', '/engagement', '/journey', '/my/workspace']) {
      await mobPage.goto(`${webUrl}${r}`, { waitUntil: 'networkidle' });
      await dismissIntroIfPresent(mobPage);
      await assertNoHorizontalOverflow(mobPage, `Mobile RTL ${r}`);
    }

    assert.equal(
      mobErrors.length,
      0,
      `Mobile Stage 5 E2E encountered errors:\n${mobErrors.join('\n')}`,
    );
    await mobContext.close();

    console.log('✅ Stage 5 E2E Playwright Verification PASSED (Desktop AR/LTR + Sara Partner Consent + Mobile 375px RTL).');
  } finally {
    if (browser) await browser.close();
    webProc.kill();
    await new Promise<void>((resolve) => apiServer.close(() => resolve()));
    db.close();
    for (const ext of ['', '-wal', '-shm']) {
      const file = TEMP_DB_PATH + ext;
      if (fs.existsSync(file)) fs.rmSync(file, { force: true });
    }
  }
}

void main();

