import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import type {
  AdminAnalyticsPayload,
  AdminModerationOverview,
  Article,
  CommunityAnswer,
  CommunityQuestion,
  CommunityReport,
  ExpertProfile,
  MyGawazInnHubPayload,
  RealWeddingStory,
  User,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-stage9-community-admin-secret';

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

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
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
  expect(secondSeed.stage9Seeded).toBe(false);

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
      if (addr && typeof addr !== 'string') baseUrl = `http://127.0.0.1:${addr.port}`;
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

describe('Stage 9 Real Weddings, Community Q&A, Experts Governance & Admin OS Analytics API', () => {
  it('enforces story moderation privacy, anti-spoof expert badges, idempotent votes, report hiding, and Admin OS analytics/RBAC isolation', async () => {
    // 1. Public SEO sitemap includes Stage 9 routes
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/real-weddings</loc>');
    expect(xml).toContain('/community</loc>');
    expect(xml).toContain('/experts</loc>');

    // 2. Public /stories ONLY shows approved stories (never 'story-seed-pending')
    const pubStoriesInit = await reqJson<RealWeddingStory[]>('/api/v1/stories');
    expect(pubStoriesInit.status).toBe(200);
    expect(pubStoriesInit.body.data?.some((s) => s.id === 'story-seed-pending')).toBe(false);
    expect(pubStoriesInit.body.data?.every((s) => s.moderationStatus === 'approved')).toBe(true);

    // Public /experts ONLY shows verified experts (never 'exp-seed-pending')
    const pubExpertsInit = await reqJson<ExpertProfile[]>('/api/v1/experts');
    expect(pubExpertsInit.status).toBe(200);
    expect(pubExpertsInit.body.data?.some((e) => e.id === 'exp-seed-pending')).toBe(false);
    expect(pubExpertsInit.body.data?.every((e) => e.verificationStatus === 'verified')).toBe(true);

    // 3. Log in Sara (Customer), Karim (Customer), Expert (usr-expert), Moderator (usr-mod), Editor (usr-editor), Full Admin (usr-admin)
    const loginAs = async (identifier: string, password: string) => {
      const r = await reqJson('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      expect(r.status).toBe(200);
      return extractSessionCookie(r.setCookie);
    };

    const saraCookie = await loginAs('sara@gawazinn.demo', 'DemoPass@2026');
    const karimCookie = await loginAs('karim@gawazinn.demo', 'DemoPass@2026');
    const expertCookie = await loginAs('expert@gawazinn.demo', 'DemoPass@2026');
    const modCookie = await loginAs('mod@gawazinn.demo', 'DemoPass@2026');
    const editorCookie = await loginAs('editor@gawazinn.demo', 'DemoPass@2026');
    const adminCookie = await loginAs('admin@gawazinn.demo', 'AdminPass@2026');

    // 4. Sara submits a Real Wedding Story -> must remain 'pending' and hidden from public until approved
    const submitStoryRes = await reqJson<RealWeddingStory>('/api/v1/stories', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        coupleTitleAr: 'قصة زفاف سارة وعلي — خطة 18 شهراً متكاملة في المعادي',
        governorateSlug: 'cairo',
        cityAr: 'المعادي — القاهرة',
        weddingYear: 2026,
        guestCount: 160,
        finishingCostEgp: 300000,
        groomTrousseauEgp: 210000,
        brideTrousseauEgp: 135000,
        weddingCostEgp: 145000,
        preparationMonths: 18,
        summaryAr: 'التزمنا بجدول زمني منظم وميزانية أسبوعية باستخدام حاسبات جواز إن.',
        lessonsLearnedAr: 'الاحتفاظ باحتياطي نقدي 10% يحمي من أي مفاجآت في الخامات.',
      }),
    });
    expect(submitStoryRes.status).toBe(201);
    const saraStory = submitStoryRes.body.data!;
    expect(saraStory.moderationStatus).toBe('pending');
    expect(saraStory.totalActualBudgetEgp).toBe(790000);

    // Public list still excludes it
    const pubStoriesBefore = await reqJson<RealWeddingStory[]>('/api/v1/stories');
    expect(pubStoriesBefore.body.data?.some((s) => s.id === saraStory.id)).toBe(false);

    // Author's own ?mine=1 sees it
    const saraMineRes = await reqJson<RealWeddingStory[]>('/api/v1/stories?mine=1', {
      cookie: saraCookie,
    });
    expect(saraMineRes.body.data?.some((s) => s.id === saraStory.id)).toBe(true);

    // Customer cannot self-approve (403)
    const selfApproveAttempt = await reqJson(`/api/v1/admin/moderation/stories/${saraStory.id}`, {
      method: 'PATCH',
      cookie: saraCookie,
      body: JSON.stringify({ moderationStatus: 'approved' }),
    });
    expect(selfApproveAttempt.status).toBe(403);

    // Moderator approves Sara's story -> now public /stories includes it + Sara receives notification
    const modApproveRes = await reqJson<RealWeddingStory>(
      `/api/v1/admin/moderation/stories/${saraStory.id}`,
      {
        method: 'PATCH',
        cookie: modCookie,
        body: JSON.stringify({ moderationStatus: 'approved', moderationNotes: 'Reviewed OK' }),
      },
    );
    expect(modApproveRes.status).toBe(200);
    expect(modApproveRes.body.data?.moderationStatus).toBe('approved');

    const pubStoriesAfter = await reqJson<RealWeddingStory[]>('/api/v1/stories');
    expect(pubStoriesAfter.body.data?.some((s) => s.id === saraStory.id)).toBe(true);

    const saraHub = await reqJson<MyGawazInnHubPayload>('/api/v1/my/hub', { cookie: saraCookie });
    expect(saraHub.body.data?.notifications.some((n) => n.linkPath === '/real-weddings')).toBe(true);

    // 5. Community Q&A: Anti-spoof isExpertAnswer, Verified Expert badge, Idempotent Toggle Votes, Helpful Marking & Report Triage
    const qRes = await reqJson<CommunityQuestion>('/api/v1/community/questions', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        categorySlug: 'finishing',
        titleAr: 'هل الأفضل سيراميك أم بورسلين لريسبشن 45 متر في شقة التجمع؟',
        bodyAr: 'نبحث عن المقارنة الواقعية بين التكلفة الكلية بالمصنعية ومادة اللصق اللازمة.',
        tags: ['سيراميك', 'بورسلين'],
      }),
    });
    expect(qRes.status).toBe(201);
    const createdQ = qRes.body.data!;

    // Regular customer Karim tries spoofing isExpertAnswer: true -> server MUST compute false!
    const spoofAnsRes = await reqJson<CommunityAnswer>(
      `/api/v1/community/questions/${createdQ.id}/answers`,
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          bodyAr: 'البورسلين مقاس 60×120 يحتاج معلم متخصص ومادة لصق عالية الجودة.',
          isExpertAnswer: true,
        }),
      },
    );
    expect(spoofAnsRes.status).toBe(201);
    const karimAns = spoofAnsRes.body.data!;
    expect(karimAns.isExpertAnswer).toBe(false);

    // Verified Expert replies -> server automatically sets isExpertAnswer: true
    const expAnsRes = await reqJson<CommunityAnswer>(
      `/api/v1/community/questions/${createdQ.id}/answers`,
      {
        method: 'POST',
        cookie: expertCookie,
        body: JSON.stringify({
          bodyAr: 'استخدم مادة لصق مرنة S1 للبورسلين مع فواصل 1.5مم وشطف الحواف بالليزر.',
        }),
      },
    );
    expect(expAnsRes.status).toBe(201);
    const expAns = expAnsRes.body.data!;
    expect(expAns.isExpertAnswer).toBe(true);

    // Idempotent Vote Toggle: +1 -> toggle off (0) -> +1 (no duplicate inflation!)
    const v1 = await reqJson<{ upvoted: boolean; upvotesCount: number }>('/api/v1/community/vote', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({ targetType: 'question', targetId: createdQ.id }),
    });
    expect(v1.status).toBe(200);
    expect(v1.body.data).toEqual({ upvoted: true, upvotesCount: 1 });

    const v2 = await reqJson<{ upvoted: boolean; upvotesCount: number }>('/api/v1/community/vote', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({ targetType: 'question', targetId: createdQ.id }),
    });
    expect(v2.body.data).toEqual({ upvoted: false, upvotesCount: 0 });

    // Non-author (Karim) cannot mark helpful on Sara's question (403)
    const badHelpful = await reqJson(
      `/api/v1/community/questions/${createdQ.id}/answers/${expAns.id}/helpful`,
      { method: 'POST', cookie: karimCookie },
    );
    expect(badHelpful.status).toBe(403);

    // Author (Sara) marks Expert's answer helpful -> marks resolved & increments expert helpfulCount
    const okHelpful = await reqJson(
      `/api/v1/community/questions/${createdQ.id}/answers/${expAns.id}/helpful`,
      { method: 'POST', cookie: saraCookie },
    );
    expect(okHelpful.status).toBe(200);

    // Report Abuse on Karim's answer -> Moderator resolves & hides it cleanly
    const reportRes = await reqJson<CommunityReport>('/api/v1/community/reports', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        targetType: 'answer',
        targetId: karimAns.id,
        reason: 'spam',
        details: 'Test moderation report triage flow',
      }),
    });
    expect(reportRes.status).toBe(201);
    const reportId = reportRes.body.data!.id;

    const modOv = await reqJson<AdminModerationOverview>('/api/v1/admin/moderation/overview', {
      cookie: modCookie,
    });
    expect(modOv.status).toBe(200);
    expect(modOv.body.data?.reports.some((r) => r.id === reportId && r.status === 'open')).toBe(true);

    const hideRes = await reqJson<CommunityReport>(`/api/v1/admin/moderation/reports/${reportId}`, {
      method: 'PATCH',
      cookie: modCookie,
      body: JSON.stringify({ action: 'resolve_hide', resolutionNote: 'Hidden during QA test' }),
    });
    expect(hideRes.status).toBe(200);
    expect(hideRes.body.data?.status).toBe('resolved_hidden');

    const pubQsAfterHide = await reqJson<CommunityQuestion[]>('/api/v1/community/questions');
    const thread = pubQsAfterHide.body.data?.find((q) => q.id === createdQ.id);
    expect(thread?.answers?.some((a) => a.id === karimAns.id)).toBe(false);
    expect(thread?.answers?.some((a) => a.id === expAns.id && a.isHelpfulMarked)).toBe(true);

    // 6. Expert Verification Governance: Apply -> Pending (hidden) -> Moderator blocked (403) -> Full Admin Verifies (200) -> Public Directory includes it!
    const candCookie = await loginAs('applicant@gawazinn.demo', 'DemoPass@2026');
    const dupApply = await reqJson('/api/v1/experts/apply', {
      method: 'POST',
      cookie: candCookie,
      body: JSON.stringify({
        displayNameAr: 'م. هاني فتحي',
        displayNameEn: 'Eng. Hany Fathy',
        specialtySlug: 'wedding_direction',
        titleAr: 'مدير حفلات',
        titleEn: 'Wedding Director',
        governorateSlug: 'cairo',
        yearsExperience: 5,
        credentialsAr: 'شهادة تنظيم فعاليات',
        credentialsEn: 'Event Mgmt Cert',
        bioAr: 'خبرة تنظيم حفلات الزفاف والقاعات في القاهرة الكبرى.',
        bioEn: 'Experience managing wedding venues and receptions across Greater Cairo.',
        verificationDocs: ['Doc-123'],
      }),
    });
    expect(dupApply.status).toBe(409);

    // Moderator tries to verify expert -> FORBIDDEN (Full Admin only!)
    const modVerifyAttempt = await reqJson('/api/v1/admin/moderation/experts/exp-seed-pending/verify', {
      method: 'PATCH',
      cookie: modCookie,
      body: JSON.stringify({ verificationStatus: 'verified' }),
    });
    expect(modVerifyAttempt.status).toBe(403);

    // Applicant posts an answer BEFORE verification -> not marked expert yet
    const preVerifyAns = await reqJson<CommunityAnswer>(
      `/api/v1/community/questions/${createdQ.id}/answers`,
      {
        method: 'POST',
        cookie: candCookie,
        body: JSON.stringify({
          bodyAr: 'تجهيز جدول توزيع الإضاءة والصوت قبل الزفاف بأسبوع مهم جداً.',
        }),
      },
    );
    expect(preVerifyAns.body.data?.isExpertAnswer).toBe(false);

    // Full Admin verifies exp-seed-pending
    const adminVerifyExp = await reqJson<ExpertProfile>(
      '/api/v1/admin/moderation/experts/exp-seed-pending/verify',
      {
        method: 'PATCH',
        cookie: adminCookie,
        body: JSON.stringify({
          verificationStatus: 'verified',
          verificationNotes: 'Verified event production license',
        }),
      },
    );
    expect(adminVerifyExp.status).toBe(200);
    expect(adminVerifyExp.body.data?.verificationStatus).toBe('verified');

    const pubExpertsAfter = await reqJson<ExpertProfile[]>('/api/v1/experts');
    expect(pubExpertsAfter.body.data?.some((e) => e.id === 'exp-seed-pending')).toBe(true);

    // Transactional backfill updated existing answers by newly verified expert!
    const refreshedThreads = await reqJson<CommunityQuestion[]>('/api/v1/community/questions');
    const updatedThread = refreshedThreads.body.data?.find((q) => q.id === createdQ.id);
    expect(
      updatedThread?.answers?.find((a) => a.id === preVerifyAns.body.data?.id)?.isExpertAnswer,
    ).toBe(true);

    // 7. Admin OS Analytics Privacy Separation & RBAC Boundaries
    const custAn = await reqJson('/api/v1/admin/analytics', { cookie: saraCookie });
    expect(custAn.status).toBe(403);

    const adminAn = await reqJson<AdminAnalyticsPayload>('/api/v1/admin/analytics', {
      cookie: adminCookie,
    });
    expect(adminAn.status).toBe(200);
    expect(adminAn.body.data?.marketplaceFunnel.totalRfqs).toBeGreaterThanOrEqual(1);
    expect(adminAn.body.data?.communitySummary.approvedStoriesCount).toBeGreaterThanOrEqual(4);
    const serialized = JSON.stringify(adminAn.body.data);
    expect(serialized).not.toContain('currentSavingsEgp');
    expect(serialized).not.toContain('nationalId');

    // Editor can update CMS article status; Moderator cannot (403)
    const modCmsAttempt = await reqJson('/api/v1/admin/cms/articles/art-finishing-22', {
      method: 'PATCH',
      cookie: modCookie,
      body: JSON.stringify({ status: 'draft' }),
    });
    expect([403, 404]).toContain(modCmsAttempt.status);
    expect(modCmsAttempt.status).toBe(403);

    const anyArtRow = db.prepare('SELECT id, status FROM articles LIMIT 1').get() as {
      id: string;
      status: string;
    };
    const editorCmsRes = await reqJson<Article>(`/api/v1/admin/cms/articles/${anyArtRow.id}`, {
      method: 'PATCH',
      cookie: editorCookie,
      body: JSON.stringify({ status: 'in_review' }),
    });
    expect(editorCmsRes.status).toBe(200);
    expect(editorCmsRes.body.data?.status).toBe('in_review');
    await reqJson(`/api/v1/admin/cms/articles/${anyArtRow.id}`, {
      method: 'PATCH',
      cookie: editorCookie,
      body: JSON.stringify({ status: anyArtRow.status }),
    });

    // Full Admin user status governance (cannot suspend self)
    const selfSuspend = await reqJson('/api/v1/admin/users/usr-admin/status', {
      method: 'PATCH',
      cookie: adminCookie,
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(selfSuspend.status).toBe(400);

    const suspendCand = await reqJson<User>('/api/v1/admin/users/usr-exp-cand/status', {
      method: 'PATCH',
      cookie: adminCookie,
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(suspendCand.status).toBe(200);
    expect(suspendCand.body.data?.status).toBe('suspended');
  });
});

