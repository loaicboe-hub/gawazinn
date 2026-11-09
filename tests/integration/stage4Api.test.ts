import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import type { EarlyStartAcademyLesson, EarlyStartOverviewPayload, SavingsBadge } from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-stage4-early-start-secret';

async function reqJson<T = unknown>(
  path: string,
  options: RequestInit & { cookie?: string } = {},
): Promise<{
  status: number;
  body: { ok: boolean; data?: T; error?: { code: string; message: string } };
  setCookie?: string;
}> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.cookie) {
    headers.Cookie = options.cookie;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  const text = await res.text();
  let parsed: { ok: boolean; data?: T; error?: { code: string; message: string } };
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { ok: res.ok };
  }
  const setCookie = res.headers.get('set-cookie') || undefined;
  return { status: res.status, body: parsed, setCookie };
}

function extractSessionCookie(setCookieHeader?: string): string {
  if (!setCookieHeader) return '';
  const match = setCookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? `${SESSION_COOKIE_NAME}=${match[1]}` : '';
}

beforeAll(async () => {
  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  runMigrations(db);
  seedDatabase(db, TEST_SECRET);
  const secondSeed = seedDatabase(db, TEST_SECRET);
  expect(secondSeed.stage4Seeded).toBe(false);

  const handler = createAppHandler(db, {
    sessionSecret: TEST_SECRET,
    appOrigin: 'http://localhost:3000',
    sessionTtlSeconds: 3600,
    isProduction: false,
  });

  server = http.createServer((req, res) => {
    void handler(req, res);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr !== 'string') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  db.close();
});

describe('Stage 4 Early Start & My Future Fund APIs + Privacy Enforcement', () => {
  it('exposes Academy public curriculum and /early-start routes in sitemap while keeping /my/future-fund excluded', async () => {
    const acadRes = await reqJson<{ lessons: EarlyStartAcademyLesson[]; completedSlugs: string[] }>(
      '/api/v1/early-start/academy',
    );
    expect(acadRes.status).toBe(200);
    expect(acadRes.body.data?.lessons.length).toBe(10);
    expect(acadRes.body.data?.completedSlugs).toEqual([]);

    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/early-start</loc>');
    expect(xml).toContain('/early-start/academy</loc>');
    expect(xml).not.toContain('/my/future-fund');
  });

  it('rejects unauthenticated requests to all private /early-start/* endpoints with 401', async () => {
    expect((await reqJson('/api/v1/early-start/overview')).status).toBe(401);
    expect(
      (
        await reqJson('/api/v1/early-start/profile', {
          method: 'PUT',
          body: JSON.stringify({ timeframePreset: '10y' }),
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await reqJson('/api/v1/early-start/goals', {
          method: 'POST',
          body: JSON.stringify({
            goalType: 'marriage',
            titleAr: 'صندوق',
            titleEn: 'Fund',
            targetAmount: 50000,
          }),
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await reqJson('/api/v1/early-start/academy/financial-literacy-before-engagement/complete', {
          method: 'POST',
          body: JSON.stringify({ completed: true }),
        })
      ).status,
    ).toBe(401);
  });

  it('returns Karim seeded 5y Future Fund metrics & strictly isolates Sara from Karim records', async () => {
    const karimRes = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimRes.setCookie);

    const saraRes = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const saraCookie = extractSessionCookie(saraRes.setCookie);

    const karimOv = await reqJson<EarlyStartOverviewPayload>('/api/v1/early-start/overview', {
      cookie: karimCookie,
    });
    expect(karimOv.status).toBe(200);
    const kData = karimOv.body.data!;
    expect(kData.profile.timeframePreset).toBe('5y');
    expect(kData.profile.timeframeMonths).toBe(60);
    expect(kData.goals.length).toBeGreaterThanOrEqual(4);
    expect(kData.summary.streakMonths).toBeGreaterThanOrEqual(4);
    expect(kData.completedLessonSlugs.length).toBeGreaterThanOrEqual(3);
    expect(kData.badges.some((b) => b.badgeKey === 'streak_3m')).toBe(true);
    expect(kData.badges.some((b) => b.badgeKey === 'academy_starter')).toBe(true);

    // Cross-user access strictly returns 404 NOT_FOUND
    const karimGoalId = kData.goals[0].id;
    const karimMsId = kData.milestones[0].id;

    expect(
      (
        await reqJson(`/api/v1/early-start/goals/${karimGoalId}/contributions`, {
          method: 'POST',
          cookie: saraCookie,
          body: JSON.stringify({ amount: 5000, contributionType: 'deposit' }),
        })
      ).status,
    ).toBe(404);

    expect(
      (
        await reqJson(`/api/v1/early-start/goals/${karimGoalId}`, {
          method: 'DELETE',
          cookie: saraCookie,
        })
      ).status,
    ).toBe(404);

    expect(
      (
        await reqJson(`/api/v1/early-start/milestones/${karimMsId}`, {
          method: 'PATCH',
          cookie: saraCookie,
          body: JSON.stringify({ completed: true }),
        })
      ).status,
    ).toBe(404);

    // Sara manages her own private 10-year plan, creates goal, logs 3-month streak, completes 3 academy lessons
    const saraProf = await reqJson<EarlyStartOverviewPayload>('/api/v1/early-start/profile', {
      method: 'PUT',
      cookie: saraCookie,
      body: JSON.stringify({
        timeframePreset: '10y',
        targetMarriageBudget: 800000,
        monthlySavingsTarget: 5500,
        reminderFrequency: 'biweekly',
      }),
    });
    expect(saraProf.status).toBe(200);
    expect(saraProf.body.data?.profile.timeframeMonths).toBe(120);
    expect(saraProf.body.data?.profile.reminderFrequency).toBe('biweekly');

    const createdGoal = await reqJson<{
      goalId: string;
      newlyEarnedBadges: SavingsBadge[];
      overview: EarlyStartOverviewPayload;
    }>('/api/v1/early-start/goals', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        goalType: 'appliances',
        titleAr: 'صندوق أجهزة المطبخ',
        titleEn: 'Kitchen Appliances Reserve',
        targetAmount: 100000,
        currentAmount: 5000,
        monthlyContribution: 2500,
      }),
    });
    expect(createdGoal.status).toBe(201);
    const goalId = createdGoal.body.data!.goalId;

    const baseNow = new Date();
    const monthIso = (offsetMonths: number) =>
      new Date(Date.UTC(baseNow.getUTCFullYear(), baseNow.getUTCMonth() + offsetMonths, 15))
        .toISOString()
        .slice(0, 10);

    await reqJson(`/api/v1/early-start/goals/${goalId}/contributions`, {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        amount: 4000,
        contributionType: 'deposit',
        contributionDate: monthIso(-2),
      }),
    });
    await reqJson(`/api/v1/early-start/goals/${goalId}/contributions`, {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        amount: 4000,
        contributionType: 'deposit',
        contributionDate: monthIso(-1),
      }),
    });
    const contrib3 = await reqJson<{
      overview: EarlyStartOverviewPayload;
      newlyEarnedBadges: SavingsBadge[];
    }>(`/api/v1/early-start/goals/${goalId}/contributions`, {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        amount: 4000,
        contributionType: 'deposit',
        contributionDate: monthIso(0),
        note: 'الثالثة ثابتة',
      }),
    });
    expect(contrib3.status).toBe(201);
    expect(contrib3.body.data?.overview.summary.streakMonths).toBeGreaterThanOrEqual(3);
    expect(
      contrib3.body.data?.overview.badges.some((b) => b.badgeKey === 'streak_3m'),
    ).toBe(true);

    // Complete 3 Academy lessons -> unlock academy_starter
    const slugs = [
      'financial-literacy-before-engagement',
      'smart-personal-budgeting-egypt',
      'habit-streaks-and-consistency',
    ];
    let lastAcadRes;
    for (const sl of slugs) {
      lastAcadRes = await reqJson<{
        completedSlugs: string[];
        overview: EarlyStartOverviewPayload;
      }>(`/api/v1/early-start/academy/${sl}/complete`, {
        method: 'POST',
        cookie: saraCookie,
        body: JSON.stringify({ completed: true }),
      });
    }
    expect(lastAcadRes?.status).toBe(200);
    expect(lastAcadRes?.body.data?.completedSlugs.length).toBe(3);
    expect(
      lastAcadRes?.body.data?.overview.badges.some((b) => b.badgeKey === 'academy_starter'),
    ).toBe(true);

    // Add & toggle custom milestone + delete goal cleanly
    const addedMs = await reqJson<EarlyStartOverviewPayload>('/api/v1/early-start/milestones', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        track: 'personal',
        titleAr: 'تطوير مهارات التفاوض واللغات قبل الخطوبة',
        titleEn: 'Complete communication & language certification',
        targetMonthsOut: 24,
      }),
    });
    expect(addedMs.status).toBe(201);
    const createdMs = addedMs.body.data!.milestones.find((m) =>
      m.titleEn.includes('communication'),
    )!;
    const toggledMs = await reqJson<EarlyStartOverviewPayload>(
      `/api/v1/early-start/milestones/${createdMs.id}`,
      {
        method: 'PATCH',
        cookie: saraCookie,
        body: JSON.stringify({ completed: true }),
      },
    );
    expect(toggledMs.status).toBe(200);
    expect(
      toggledMs.body.data?.milestones.find((m) => m.id === createdMs.id)?.completed,
    ).toBe(true);

    const delGoal = await reqJson<EarlyStartOverviewPayload>(`/api/v1/early-start/goals/${goalId}`, {
      method: 'DELETE',
      cookie: saraCookie,
    });
    expect(delGoal.status).toBe(200);
    expect(delGoal.body.data?.goals.some((g) => g.id === goalId)).toBe(false);
  });
});

