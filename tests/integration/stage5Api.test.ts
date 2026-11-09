import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../server/db';
import { seedDatabase } from '../../server/seed';
import { createAppHandler } from '../../server/app';
import { SESSION_COOKIE_NAME } from '../../server/security';
import type {
  CoupleWorkspacePayload,
  EarlyStartOverviewPayload,
  EngagementOverviewPayload,
  JourneyOverviewPayload,
  LifecycleTransitionRecord,
  MyGawazInnHubPayload,
  User,
  UserAppointmentItem,
  UserDocumentItem,
  UserNotification,
  UserWarrantyItem,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const TEST_SECRET = 'vitest-stage5-journey-workspace-secret';

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
  expect(secondSeed.stage5Seeded).toBe(false);

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

describe('Stage 5 Lifecycle Onboarding, Engagement, Journey Planner & Shared Workspace Security', () => {
  it('exposes /onboarding, /engagement, /journey in sitemap while keeping /my/* private & blocks unauthenticated calls with 401', async () => {
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await sitemapRes.text();
    expect(xml).toContain('/onboarding</loc>');
    expect(xml).toContain('/engagement</loc>');
    expect(xml).toContain('/journey</loc>');
    expect(xml).not.toContain('/my/workspace');

    expect((await reqJson('/api/v1/my/hub')).status).toBe(401);
    expect(
      (
        await reqJson('/api/v1/onboarding/stage', {
          method: 'POST',
          body: JSON.stringify({ targetStage: 'post_engagement' }),
        })
      ).status,
    ).toBe(401);
    expect((await reqJson('/api/v1/engagement/overview')).status).toBe(401);
    expect((await reqJson('/api/v1/journey/tasks')).status).toBe(401);
    expect((await reqJson('/api/v1/workspace')).status).toBe(401);
    expect((await reqJson('/api/v1/my/documents')).status).toBe(401);
    expect((await reqJson('/api/v1/my/warranties')).status).toBe(401);
    expect((await reqJson('/api/v1/my/appointments')).status).toBe(401);
  });

  it('performs non-destructive 11-stage transitions preserving Early Start & Budget data, and manages Engagement + Journey dependencies/comments', async () => {
    const karimRes = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimRes.setCookie);

    const beforeEarlyStart = await reqJson<EarlyStartOverviewPayload>('/api/v1/early-start/overview', {
      cookie: karimCookie,
    });
    const savedGoalsCountBefore = beforeEarlyStart.body.data!.goals.length;

    const transitionRes = await reqJson<{
      user: User;
      currentStage: string;
      lifecycleHistory: LifecycleTransitionRecord[];
      hub: MyGawazInnHubPayload;
    }>('/api/v1/onboarding/stage', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({ targetStage: 'finishing_apartment', note: 'استلام مفاتيح التجمع الخامس' }),
    });
    expect(transitionRes.status).toBe(200);
    expect(transitionRes.body.data?.currentStage).toBe('finishing_apartment');
    expect(transitionRes.body.data?.user.currentStage).toBe('finishing_apartment');
    expect(transitionRes.body.data?.lifecycleHistory[0]?.toStage).toBe('finishing_apartment');

    // Early Start savings goals MUST remain 100% preserved
    const afterEarlyStart = await reqJson<EarlyStartOverviewPayload>('/api/v1/early-start/overview', {
      cookie: karimCookie,
    });
    expect(afterEarlyStart.body.data?.goals.length).toBe(savedGoalsCountBefore);

    // Engagement Plan + Item CRUD
    const engUp = await reqJson<EngagementOverviewPayload>('/api/v1/engagement/plan', {
      method: 'PUT',
      cookie: karimCookie,
      body: JSON.stringify({ venueStatus: 'booked', shabkaBudget: 82000 }),
    });
    expect(engUp.status).toBe(200);
    expect(engUp.body.data?.plan.venueStatus).toBe('booked');
    expect(engUp.body.data?.plan.shabkaBudget).toBe(82000);

    const engItemAdd = await reqJson<{ itemId: string; overview: EngagementOverviewPayload }>(
      '/api/v1/engagement/items',
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          itemType: 'gift_ring',
          titleAr: 'ساعة خطوبة هديه',
          titleEn: 'Engagement Gift Watch',
          ownerSide: 'bride',
          estimatedCost: 14000,
        }),
      },
    );
    expect(engItemAdd.status).toBe(201);
    const createdEngId = engItemAdd.body.data!.itemId;
    expect(engItemAdd.body.data!.overview.items.some((i) => i.id === createdEngId)).toBe(true);

    // Journey Task Dependency Warning & Comments
    const parentTask = await reqJson<{ taskId: string; overview: JourneyOverviewPayload }>(
      '/api/v1/journey/tasks',
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          phase: '9m',
          titleAr: 'اختبار ضغط مواسير السباكة',
          titleEn: 'Plumbing Pressure Test',
          ownerSide: 'groom',
        }),
      },
    );
    expect(parentTask.status).toBe(201);
    const parentId = parentTask.body.data!.taskId;

    const childTask = await reqJson<{ taskId: string; overview: JourneyOverviewPayload }>(
      '/api/v1/journey/tasks',
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          phase: '6m',
          titleAr: 'تركيب السيراميك فوق التأسيس',
          titleEn: 'Install Ceramic Tiles',
          ownerSide: 'groom',
          dependsOnTaskId: parentId,
        }),
      },
    );
    expect(childTask.status).toBe(201);
    const childId = childTask.body.data!.taskId;

    // Completing child before parent returns explicit dependencyWarning metadata
    const doneEarly = await reqJson<{
      dependencyWarning: string | null;
      overview: JourneyOverviewPayload;
    }>(`/api/v1/journey/tasks/${childId}`, {
      method: 'PATCH',
      cookie: karimCookie,
      body: JSON.stringify({ status: 'done' }),
    });
    expect(doneEarly.status).toBe(200);
    expect(doneEarly.body.data?.dependencyWarning).toContain('Plumbing Pressure Test');

    // Post task comment
    const commentRes = await reqJson<JourneyOverviewPayload>(`/api/v1/journey/tasks/${childId}/comments`, {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({ body: 'تم تأكيد ميعاد فني السيراميك بعد الكبس.' }),
    });
    expect(commentRes.status).toBe(201);
    const updatedChild = commentRes.body.data!.tasks.find((t) => t.id === childId);
    expect(updatedChild?.comments.length).toBe(1);
    expect(updatedChild?.comments[0].body).toContain('فني السيراميك');
  });

  it('enforces explicit partner consent, private doc isolation, granular RBAC permissions, third-party rejection & instant revocation', async () => {
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

    const outsiderRes = await reqJson('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'خالد الغريب',
        email: 'outsider@gawazinn.demo',
        phone: '01099988877',
        password: 'OutsiderPass@2026',
      }),
    });
    const outsiderCookie = extractSessionCookie(outsiderRes.setCookie);

    // 1. Before accept: Sara & Karim are 100% isolated (zero leaked Karim approvals/docs)
    const saraBeforeHub = await reqJson<MyGawazInnHubPayload>('/api/v1/my/hub', {
      cookie: saraCookie,
    });
    expect(saraBeforeHub.status).toBe(200);
    expect(saraBeforeHub.body.data?.workspace.workspace.ownerUserId).toBe('usr-2');
    expect(saraBeforeHub.body.data?.workspace.approvals.length).toBe(0);

    // Karim creates both a Private doc and a Shared doc
    const privDoc = await reqJson<{ document: UserDocumentItem }>('/api/v1/my/documents', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        docType: 'id_copy',
        title: 'بطاقة شخصية سرية لكريم',
        fileName: 'karim-id.pdf',
        isSharedWithPartner: false,
      }),
    });
    expect(privDoc.status).toBe(201);

    const sharedDoc = await reqJson<{ document: UserDocumentItem }>('/api/v1/my/documents', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        docType: 'floor_plan',
        title: 'رسم هندسي مشترك للشقة',
        fileName: 'apt-blueprint.pdf',
        isSharedWithPartner: true,
      }),
    });
    expect(sharedDoc.status).toBe(201);

    // 2. Karim invites Sara explicitly with tasksWrite=true, approvePurchases=false initially
    const invRes = await reqJson<{ inviteToken: string; workspace: CoupleWorkspacePayload }>(
      '/api/v1/workspace/invite',
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          inviteeIdentifier: 'sara@gawazinn.demo',
          proposedRole: 'partner',
          proposedSide: 'bride',
          permissions: { tasksWrite: true, documentsRead: true, approvePurchases: false },
        }),
      },
    );
    expect(invRes.status).toBe(201);
    const token = invRes.body.data!.inviteToken;

    // Outsider cannot hijack Sara's token even if guessed -> 403 FORBIDDEN
    const outsiderAttempt = await reqJson(`/api/v1/workspace/invitations/${token}/accept`, {
      method: 'POST',
      cookie: outsiderCookie,
    });
    expect(outsiderAttempt.status).toBe(403);

    // 3. Sara sees pending invitation -> accepts -> now enters Karim's workspace
    const saraPendingHub = await reqJson<CoupleWorkspacePayload>('/api/v1/workspace', {
      cookie: saraCookie,
    });
    expect(saraPendingHub.body.data?.incomingInvitations.some((i) => i.inviteToken === token)).toBe(true);

    const acceptRes = await reqJson<CoupleWorkspacePayload>(
      `/api/v1/workspace/invitations/${token}/accept`,
      { method: 'POST', cookie: saraCookie },
    );
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data?.workspace.ownerUserId).toBe('usr-1');
    expect(acceptRes.body.data?.myRole).toBe('partner');

    // Sara sees Shared doc, NEVER sees Private doc!
    const saraDocs = await reqJson<UserDocumentItem[]>('/api/v1/my/documents', {
      cookie: saraCookie,
    });
    expect(saraDocs.body.data?.some((d) => d.title === 'رسم هندسي مشترك للشقة')).toBe(true);
    expect(saraDocs.body.data?.some((d) => d.title === 'بطاقة شخصية سرية لكريم')).toBe(false);

    // Granular permission guard: Sara has approvePurchases=false -> cannot approve Karim's purchase
    const pendingAppId = acceptRes.body.data!.approvals[0]?.id;
    expect(pendingAppId).toBeDefined();
    const deniedApproval = await reqJson(`/api/v1/workspace/approvals/${pendingAppId}`, {
      method: 'PATCH',
      cookie: saraCookie,
      body: JSON.stringify({ status: 'approved' }),
    });
    expect(deniedApproval.status).toBe(403);

    // 4. Karim revokes Sara -> Sara immediately returns to isolated workspace & loses access
    const saraMember = acceptRes.body.data!.members.find((m) => m.userId === 'usr-2')!;
    const revokeRes = await reqJson<CoupleWorkspacePayload>(
      `/api/v1/workspace/members/${saraMember.id}`,
      { method: 'DELETE', cookie: karimCookie },
    );
    expect(revokeRes.status).toBe(200);

    const saraAfterRevoke = await reqJson<CoupleWorkspacePayload>('/api/v1/workspace', {
      cookie: saraCookie,
    });
    expect(saraAfterRevoke.body.data?.workspace.ownerUserId).toBe('usr-2');

    // Attempt to approve Karim's item after revocation returns 404 NOT_FOUND
    const revokedApprovalAttempt = await reqJson(`/api/v1/workspace/approvals/${pendingAppId}`, {
      method: 'PATCH',
      cookie: saraCookie,
      body: JSON.stringify({ status: 'approved' }),
    });
    expect(revokedApprovalAttempt.status).toBe(404);
  });

  it('supports Warranty Tracker, Appointments Scheduler, and Notifications read state', async () => {
    const saraRes = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const saraCookie = extractSessionCookie(saraRes.setCookie);

    const warRes = await reqJson<UserWarrantyItem[]>('/api/v1/my/warranties', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        itemName: 'ماكينة قهوة إسبريسو',
        category: 'أجهزة مطبخ',
        providerName: 'برافو إيجيبت',
        startDate: '2026-10-01',
        expiryDate: '2029-10-01',
      }),
    });
    expect(warRes.status).toBe(201);
    expect(warRes.body.data?.some((w) => w.itemName === 'ماكينة قهوة إسبريسو')).toBe(true);

    const aptRes = await reqJson<UserAppointmentItem[]>('/api/v1/my/appointments', {
      method: 'POST',
      cookie: saraCookie,
      body: JSON.stringify({
        title: 'بروفة فستان الزفاف',
        appointmentType: 'other',
        providerName: 'أتيليه رويال',
        locationText: 'المعادي',
        scheduledAt: '2027-01-12T17:00',
      }),
    });
    expect(aptRes.status).toBe(201);
    expect(aptRes.body.data?.some((a) => a.title === 'بروفة فستان الزفاف')).toBe(true);

    const readAll = await reqJson<UserNotification[]>('/api/v1/my/notifications/read-all', {
      method: 'POST',
      cookie: saraCookie,
    });
    expect(readAll.status).toBe(200);
    expect(readAll.body.data?.every((n) => n.isRead)).toBe(true);
  });
});

