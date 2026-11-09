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

const TEMP_DB_PATH = path.resolve(process.cwd(), '.data', 'e2e-stage2.db');
const E2E_SECRET = 'e2e-stage2-verification-secret';

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

async function assertImagesLoaded(page: Page, routeLabel: string): Promise<void> {
  const brokenImgs = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const bad: string[] = [];
    for (const img of imgs) {
      img.loading = 'eager';
      img.scrollIntoView();
      if (!img.complete) {
        await new Promise((r) => setTimeout(r, 700));
      }
      if (img.complete && img.naturalWidth === 0) {
        bad.push(img.src);
      }
    }
    return bad;
  });
  assert.equal(brokenImgs.length, 0, `Broken images on ${routeLabel}: ${brokenImgs.join(', ')}`);
}

async function main() {
  if (CHROME_CANDIDATES.length === 0) {
    throw new Error('No Chromium/Chrome executable found for Stage 2 E2E tests.');
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

    // ================= 1. DESKTOP (1440x900) STAGE 2 ENCYCLOPEDIA & PLANNERS FLOW =================
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

    // 1. Finishing Encyclopedia (22 Stages + Materials + Contractors Consultation Prefill)
    await page.goto(`${webUrl}/finishing/encyclopedia`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const stepsText = await page.getByTestId('finishing-steps-count').textContent();
    assert.ok(stepsText?.includes('22'), `Expected 22 stages count, got: ${stepsText}`);
    await assertNoHorizontalOverflow(page, 'Desktop /finishing/encyclopedia');

    await page.getByTestId('fin-tab-materials').click();
    await page.waitForURL('**/finishing/materials');
    await page.getByTestId('materials-grid').waitFor({ state: 'visible' });
    await assertImagesLoaded(page, '/finishing/materials');

    await page.getByTestId('fin-tab-contractors').click();
    await page.waitForURL('**/finishing/contractors');
    await page.getByTestId('contractors-grid').waitFor({ state: 'visible' });
    await page.locator('[data-testid^="contractor-consult-"]').first().click();
    await page.locator('#finishing-quote-title').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');

    // Before/After showcase filter on /finishing
    await page.goto(`${webUrl}/finishing`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('ba-filter-alexandria').click();
    await page.getByTestId('ba-project-proj-4').waitFor({ state: 'visible' });

    // 2. Groom Configurator + Signed-in SQLite Persistence + Groom Encyclopedia (26 subcategories)
    await page.goto(`${webUrl}/groom`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const initialGroomTotal = await page.getByTestId('groom-configured-total').textContent();
    await page.getByTestId('groom-tier-tier_300k').click();
    const tier300Total = await page.getByTestId('groom-configured-total').textContent();
    assert.notEqual(initialGroomTotal, tier300Total, 'Switching tier to 300k must update configured total');

    // Sign in as Karim -> make slot swap -> reload -> verify persistence from SQLite
    await page.getByTestId('header-login-btn').click();
    await page.getByRole('button', { name: /كريم|Demo Customer/i }).click();
    await page.getByTestId('user-menu-btn').waitFor({ state: 'visible' });
    const putGroomDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/my/groom-plan') && res.request().method() === 'PUT',
    );
    await page.getByTestId('groom-tier-tier_300k').click();
    await putGroomDone;
    const putSwapDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/my/groom-plan') && res.request().method() === 'PUT',
    );
    await page.getByTestId('slot-opt-fridge-opt-fr-pre').click();
    await putSwapDone;
    const afterSwapTotal = await page.getByTestId('groom-configured-total').textContent();
    await page.reload({ waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const afterReloadTotal = await page.getByTestId('groom-configured-total').textContent();
    assert.equal(afterReloadTotal, afterSwapTotal, 'Groom package selections must persist across reload');

    await page.goto(`${webUrl}/groom/encyclopedia`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const groomGuideCount = await page.locator('[data-testid^="groom-sub-"]').count();
    assert.equal(groomGuideCount, 26, 'Expected 26 groom encyclopedia subcategories');

    // 3. Bride Smart Planner (Presets + Custom Item Persistence) + Bride Encyclopedia (19 categories)
    await page.goto(`${webUrl}/bride`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const putPresetDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/my/bride-plan') && res.request().method() === 'PUT',
    );
    await page.getByTestId('bride-preset-extended').click();
    await putPresetDone;

    await page.getByTestId('bride-custom-label-input').fill('غلاية قهوة تركي زجاجية');
    const putCustomDone = page.waitForResponse(
      (res) => res.url().includes('/api/v1/my/bride-plan') && res.request().method() === 'PUT',
    );
    await page.getByTestId('bride-add-custom-btn').click();
    await putCustomDone;
    await page.reload({ waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByText('غلاية قهوة تركي زجاجية').waitFor({ state: 'visible' });

    await page.goto(`${webUrl}/bride/encyclopedia`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    const brideCatsCount = await page.locator('[data-testid^="bride-cat-"]').count();
    assert.equal(brideCatsCount, 19, 'Expected 19 bridal encyclopedia categories');

    // 4. Glossary, FAQs & Encyclopedia Hub
    await page.goto(`${webUrl}/glossary`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('glossary-faq-search').fill('الشرب');
    await page.getByTestId('glossary-card-el-sherb-datum').waitFor({ state: 'visible' });

    await page.getByTestId('tab-faqs').click();
    await page.waitForURL('**/faqs');
    await page.getByTestId('faqs-accordion').waitFor({ state: 'visible' });
    await page.locator('[data-testid^="faq-item-"]').nth(1).locator('button').click();

    await page.goto(`${webUrl}/encyclopedia`, { waitUntil: 'networkidle' });
    await dismissIntroIfPresent(page);
    await page.getByTestId('specialized-hub-links').waitFor({ state: 'visible' });
    const cmsCatCount = await page.locator('[data-testid^="cms-category-"]').count();
    assert.equal(cmsCatCount, 13, 'Expected 13 CMS categories on /encyclopedia');
    await assertImagesLoaded(page, '/encyclopedia');

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
      '/finishing/encyclopedia',
      '/finishing/materials',
      '/finishing/contractors',
      '/groom',
      '/groom/encyclopedia',
      '/bride',
      '/bride/encyclopedia',
      '/glossary',
      '/faqs',
    ]) {
      await mPage.goto(`${webUrl}${mobRoute}`, { waitUntil: 'networkidle' });
      await dismissIntroIfPresent(mPage);
      await assertNoHorizontalOverflow(mPage, `Mobile RTL ${mobRoute}`);
    }

    await mobileCtx.close();

    assert.equal(consoleErrors.length, 0, `Unexpected console errors:\n${consoleErrors.join('\n')}`);
    assert.equal(pageErrors.length, 0, `Unexpected page errors:\n${pageErrors.join('\n')}`);
    assert.equal(httpFailures.length, 0, `Unexpected HTTP >= 400 responses:\n${httpFailures.join('\n')}`);

    console.log('✅ Stage 2 E2E Suite Passed: Encyclopedias, Configurator, Smart Bridal Planner, Glossary, FAQs & Mobile RTL!');
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
  console.error('❌ Stage 2 E2E Failure:', err);
  process.exit(1);
});

