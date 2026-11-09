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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage9.db');
const E2E_SECRET = 'e2e-stage9-community-admin-secret';

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
    throw new Error('No Chromium/Chrome executable found for Stage 9 E2E tests.');
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
      appOrigin: 'http://127.0.0.1:4179',
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
    [viteEntry, 'preview', '--port', '4179', '--strictPort'],
    {
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      },
      stdio: 'ignore',
      shell: false,
    },
  );

  const webUrl = 'http://127.0.0.1:4179';
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

    // 1. Visit /real-weddings: ensure pending seeded draft is hidden publicly
    await page.goto(`${webUrl}/real-weddings`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('real-weddings-heading').waitFor({ state: 'visible' });
    assert.equal(await page.getByTestId('real-wedding-card-story-seed-pending').count(), 0);
    await page.getByTestId('real-wedding-card-story-cairo-1').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'desktop /real-weddings');

    // 2. Customer Sign In (Sara) -> Submit New Wedding Story -> Stays Pending
    await loginViaModal(page, 'sara@gawazinn.demo', 'DemoPass@2026');
    await page.getByTestId('story-open-form-btn').click();
    await page.getByTestId('submit-story-form').waitFor({ state: 'visible' });
    await page.getByTestId('story-couple-title-ar').fill('قصة E2E سارة ومحمد في الزمالك 2026');
    await page.getByTestId('story-gov-select').selectOption('cairo');
    await page.getByTestId('story-city-ar').fill('الزمالك');
    await page.getByTestId('story-summary-ar').fill('تخطيط مبكر ومنظم للتشطيب والجهاز باستخدام الحاسبات والالتزام بالميزانية.');
    await page.getByTestId('story-lessons-ar').fill('مراجعة عروض الأسعار مكتوبة قبل دفع أي مقدم.');
    const storyCreateDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/stories') && res.request().method() === 'POST',
    );
    await page.getByTestId('story-submit-btn').click();
    const storyRes = await storyCreateDone;
    assert.equal(storyRes.status(), 201);
    const storyJson = (await storyRes.json()) as { data: { id: string; moderationStatus: string } };
    const newStoryId = storyJson.data.id;
    assert.equal(storyJson.data.moderationStatus, 'pending');
    await page.getByTestId('story-pending-notice').waitFor({ state: 'visible' });
    await page.getByTestId(`my-story-status-${newStoryId}`).waitFor({ state: 'visible' });
    // Public gallery still MUST NOT show pending story!
    assert.equal(await page.getByTestId(`real-wedding-card-${newStoryId}`).count(), 0);

    // 3. Visit /community -> Ask Question -> Upvote -> Report Abuse
    await page.goto(`${webUrl}/community`, { waitUntil: 'networkidle' });
    await page.getByTestId('community-heading').waitFor({ state: 'visible' });
    await page.getByTestId('community-open-ask-btn').click();
    await page.getByTestId('community-ask-title').fill('سؤال E2E: أفضل طريقة لحساب تكلفة المطبخ الألوميتال؟');
    await page.getByTestId('community-ask-body').fill('مطبخ 14 متر مربع ونبحث عن الفرق الفعلي بين الألوميتال والكلادينج.');
    const askDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/community/questions') && res.request().method() === 'POST',
    );
    await page.getByTestId('community-ask-submit').click();
    const askRes = await askDone;
    assert.equal(askRes.status(), 201);
    const qJson = (await askRes.json()) as { data: { id: string } };
    const newQuestionId = qJson.data.id;
    await page.getByTestId(`community-question-${newQuestionId}`).waitFor({ state: 'visible' });

    const voteDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/community/vote') && res.request().method() === 'POST',
    );
    await page.getByTestId(`vote-btn-question-${newQuestionId}`).click();
    const voteRes = await voteDone;
    assert.equal(voteRes.status(), 200);
    assert.ok((await page.getByTestId(`vote-btn-question-${newQuestionId}`).innerText()).includes('1'));

    // Report answer ca-seed-2 for moderator triage
    await page.getByTestId('report-btn-answer-ca-seed-2').click();
    await page.getByTestId('community-report-modal').waitFor({ state: 'visible' });
    await page.getByTestId('report-reason-select').selectOption('spam');
    await page.getByTestId('report-details-input').fill('E2E triage test report');
    const repDone = page.waitForResponse(
      (res) => res.url().endsWith('/api/v1/community/reports') && res.request().method() === 'POST',
    );
    await page.getByTestId('report-submit-btn').click();
    const repRes = await repDone;
    assert.equal(repRes.status(), 201);
    const repJson = (await repRes.json()) as { data: { id: string } };
    const newReportId = repJson.data.id;

    // 4. Logout -> Verified Expert posts Answer -> Verified Expert Badge renders + Sara marks Helpful!
    await logoutViaMenu(page);
    await loginViaModal(page, 'expert@gawazinn.demo', 'DemoPass@2026');
    await page.goto(`${webUrl}/community`, { waitUntil: 'networkidle' });
    await page.getByTestId(`answer-input-${newQuestionId}`).fill('المقاس القياسي للمتر بالكلادينج والرخام الجرانيت يشمل الإكسسوارات.');
    const expAnsDone = page.waitForResponse(
      (res) => res.url().includes(`/community/questions/${newQuestionId}/answers`) && res.status() === 201,
    );
    await page.getByTestId(`answer-submit-${newQuestionId}`).click();
    const expAnsRes = await expAnsDone;
    const expAnsJson = (await expAnsRes.json()) as { data: { id: string; isExpertAnswer: boolean } };
    assert.equal(expAnsJson.data.isExpertAnswer, true);
    await page.getByTestId(`expert-answer-badge-${expAnsJson.data.id}`).waitFor({ state: 'visible' });

    // 5. Logout -> Moderator approves Sara's story & hides reported content
    await logoutViaMenu(page);
    await loginViaModal(page, 'mod@gawazinn.demo', 'DemoPass@2026');
    await page.goto(`${webUrl}/admin`, { waitUntil: 'networkidle' });
    await page.getByTestId('admin-analytics-panel').waitFor({ state: 'visible' });
    await page.getByTestId('admin-tab-moderation').click();
    await page.getByTestId('admin-moderation-panel').waitFor({ state: 'visible' });

    const approveDone = page.waitForResponse(
      (res) => res.url().includes(`/admin/moderation/stories/${newStoryId}`) && res.status() === 200,
    );
    await page.getByTestId(`mod-story-approve-${newStoryId}`).click();
    await approveDone;

    const reportDone = page.waitForResponse(
      (res) => res.url().includes(`/admin/moderation/reports/${newReportId}`) && res.status() === 200,
    );
    await page.getByTestId(`mod-report-hide-${newReportId}`).click();
    await reportDone;

    // Verify sara's approved story is now public on /real-weddings
    await page.goto(`${webUrl}/real-weddings`, { waitUntil: 'networkidle' });
    await page.getByTestId(`real-wedding-card-${newStoryId}`).waitFor({ state: 'visible' });

    // 6. Logout -> Full Admin verifies pending expert applicant -> Listed publicly on /experts
    await logoutViaMenu(page);
    await loginViaModal(page, 'admin@gawazinn.demo', 'AdminPass@2026');
    await page.goto(`${webUrl}/admin`, { waitUntil: 'networkidle' });
    await page.getByTestId('admin-tab-moderation').click();
    const verifyExpDone = page.waitForResponse(
      (res) => res.url().includes('/admin/moderation/experts/exp-seed-pending/verify') && res.status() === 200,
    );
    await page.getByTestId('admin-expert-verify-exp-seed-pending').click();
    await verifyExpDone;

    await page.goto(`${webUrl}/experts`, { waitUntil: 'networkidle' });
    await page.getByTestId('expert-card-exp-seed-pending').waitFor({ state: 'visible' });
    await page.getByTestId('expert-verified-badge-exp-seed-pending').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(page, 'desktop /experts');

    // Language Switch Check on /community (EN LTR & AR RTL)
    await page.goto(`${webUrl}/community`, { waitUntil: 'networkidle' });
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.dir), 'ltr');
    await assertNoHorizontalOverflow(page, 'desktop /community LTR');
    await page.getByTestId('lang-switch-btn').click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.dir), 'rtl');

    // 7. Mobile 375px RTL Overflow & Rendering Audit
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

    await mPage.goto(`${webUrl}/real-weddings`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(mPage);
    await mPage.getByTestId('real-weddings-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /real-weddings');

    await mPage.goto(`${webUrl}/community`, { waitUntil: 'networkidle' });
    await mPage.getByTestId('community-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /community');

    await mPage.goto(`${webUrl}/experts`, { waitUntil: 'networkidle' });
    await mPage.getByTestId('experts-directory-heading').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /experts');

    await loginViaModal(mPage, 'admin@gawazinn.demo', 'AdminPass@2026');
    await mPage.goto(`${webUrl}/admin`, { waitUntil: 'networkidle' });
    await mPage.getByTestId('admin-analytics-panel').waitFor({ state: 'visible' });
    await assertNoHorizontalOverflow(mPage, 'mobile /admin overview');
    for (const tab of ['admin-tab-moderation', 'admin-tab-cms', 'admin-tab-customers']) {
      await mPage.getByTestId(tab).click();
      await assertNoHorizontalOverflow(mPage, `mobile /admin ${tab}`);
    }

    assert.equal(errors.length, 0, `Stage 9 E2E captured errors:\n${errors.join('\n')}`);
    console.log('Stage 9 E2E Chrome verification PASSED (Desktop AR/EN + Mobile 375px RTL, 0 errors).');
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

