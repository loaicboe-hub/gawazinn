import fs from 'node:fs';
import path from 'node:path';
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
  ExpertProfile,
  HomeCareDirectoryPayload,
  HomeFileOverviewPayload,
  RealWeddingStory,
  UserDocumentItem,
  VendorListing,
} from '../../shared/types';

let db: DatabaseSync;
let server: http.Server;
let baseUrl = '';

const AUDIT_SECRET = 'vitest-stage12-security-seo-audit-secret';

async function reqRaw(
  reqPath: string,
  options: RequestInit & { cookie?: string } = {},
): Promise<{
  status: number;
  text: string;
  headers: Headers;
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

  const res = await fetch(`${baseUrl}${reqPath}`, { ...options, headers });
  const text = await res.text();
  return {
    status: res.status,
    text,
    headers: res.headers,
    setCookie: res.headers.get('set-cookie') || undefined,
  };
}

async function reqJson<T = unknown>(
  reqPath: string,
  options: RequestInit & { cookie?: string } = {},
): Promise<{
  status: number;
  body: { ok: boolean; data?: T; error?: { code: string; message: string } };
  headers: Headers;
  setCookie?: string;
}> {
  const raw = await reqRaw(reqPath, options);
  let parsed: { ok: boolean; data?: T; error?: { code: string; message: string } };
  try {
    parsed = JSON.parse(raw.text);
  } catch {
    parsed = { ok: raw.status >= 200 && raw.status < 300 };
  }
  return {
    status: raw.status,
    body: parsed,
    headers: raw.headers,
    setCookie: raw.setCookie,
  };
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
  seedDatabase(db, AUDIT_SECRET);

  const handler = createAppHandler(db, {
    sessionSecret: AUDIT_SECRET,
    appOrigin: 'https://gawazinn.vercel.app',
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

describe('Stage 12 Release Security, Privacy, SEO & DB Parity Audit', () => {
  it('enforces exact SQLite and PostgreSQL migration file parity (001 through 011)', () => {
    const sqliteFiles = fs
      .readdirSync(path.resolve(process.cwd(), 'db/migrations/sqlite'))
      .filter((f) => f.endsWith('.sql'))
      .sort();
    const pgFiles = fs
      .readdirSync(path.resolve(process.cwd(), 'db/migrations/postgres'))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    expect(sqliteFiles.length).toBeGreaterThanOrEqual(11);
    expect(sqliteFiles).toEqual(pgFiles);
    expect(sqliteFiles[0]).toMatch(/^001_/);
    expect(sqliteFiles[sqliteFiles.length - 1]).toMatch(/^011_/);
  });

  it('keeps /sitemap.xml valid XML containing all Stage 1-11 public routes and zero private/PII URLs', async () => {
    const res = await reqRaw('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type') || '').toContain('application/xml');

    const xml = res.text;
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');

    const requiredPublicPaths = [
      'https://gawazinn.vercel.app/</loc>',
      '/finishing</loc>',
      '/calculators</loc>',
      '/early-start</loc>',
      '/early-start/academy</loc>',
      '/products</loc>',
      '/vendors</loc>',
      '/real-weddings</loc>',
      '/community</loc>',
      '/experts</loc>',
      '/assistant</loc>',
      '/room-designer</loc>',
      '/newlyweds-guide</loc>',
      '/home-care</loc>',
    ];
    for (const p of requiredPublicPaths) {
      expect(xml).toContain(p);
    }

    const forbiddenPrivateFragments = [
      '/portal',
      '/my/',
      '/rfq',
      '/admin',
      '/wedding-day',
      '/rsvp/',
      'gawazinn.vercel.app/vendor</loc>',
      'gawazinn.vercel.app/vendor/',
    ];
    for (const forbidden of forbiddenPrivateFragments) {
      expect(xml).not.toContain(forbidden);
    }

    const robotsContent = fs.readFileSync(path.resolve(process.cwd(), 'public/robots.txt'), 'utf8');
    expect(robotsContent).toContain('Disallow: /my/');
    expect(robotsContent).toContain('Disallow: /admin');
    expect(robotsContent).toContain('Disallow: /rfq');
    expect(robotsContent).toContain('Disallow: /wedding-day');
    expect(robotsContent).toContain('Disallow: /rsvp/');
  });

  it('prevents password hash, National ID, unapproved content, or private financial leaks in public APIs', async () => {
    const publicEndpoints = [
      '/api/v1/health',
      '/api/v1/bootstrap',
      '/api/v1/vendors',
      '/api/v1/stories',
      '/api/v1/experts',
      '/api/v1/community/questions',
      '/api/v1/home-care/directory',
    ];

    for (const ep of publicEndpoints) {
      const res = await reqRaw(ep);
      expect(res.status).toBe(200);
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
      expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');

      expect(res.text).not.toContain('password_hash');
      expect(res.text).not.toContain('passwordHash');
      expect(res.text).not.toContain('national_id_hash');
      expect(res.text).not.toContain('nationalIdHash');
      expect(res.text).not.toContain('ABB-PNL-16L-2026');
      expect(res.text).not.toContain('Jotun 10678 Fenomastic My Home');
      expect(res.text).not.toContain('BR-PPR-2026-10BAR');
      expect(res.text).not.toMatch(/\b[23]\d{13}\b/);
    }

    const storiesRes = await reqJson<RealWeddingStory[]>('/api/v1/stories');
    expect(storiesRes.status).toBe(200);
    const stories = storiesRes.body.data || [];
    expect(stories.length).toBeGreaterThanOrEqual(3);
    expect(stories.every((s) => s.moderationStatus === 'approved')).toBe(true);
    expect(stories.some((s) => s.id === 'story-seed-pending')).toBe(false);

    const expertsRes = await reqJson<ExpertProfile[]>('/api/v1/experts');
    expect(expertsRes.status).toBe(200);
    const experts = expertsRes.body.data || [];
    expect(experts.length).toBeGreaterThanOrEqual(3);
    expect(experts.every((e) => e.verificationStatus === 'verified')).toBe(true);
    expect(experts.some((e) => e.id === 'exp-seed-pending')).toBe(false);

    const vendorsRes = await reqJson<VendorListing[]>('/api/v1/vendors');
    expect(vendorsRes.status).toBe(200);
    for (const v of vendorsRes.body.data || []) {
      if (v.reviewsCount === 0) {
        expect(v.ratingAvg).toBe(0);
      }
    }

    const homeCareRes = await reqJson<HomeCareDirectoryPayload>('/api/v1/home-care/directory');
    expect(homeCareRes.status).toBe(200);
    expect((homeCareRes.body.data?.vendors || []).length).toBeGreaterThan(0);

    const anonAssistant = await reqJson('/api/v1/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({
        query: 'كم تكلفة تشطيب شقة 120 متر متوسط؟',
        language: 'ar',
      }),
    });
    expect(anonAssistant.status).toBe(200);
    const anonText = JSON.stringify(anonAssistant.body);
    expect(anonText).not.toContain('صندوق الزواج والأثاث الكلي');
    expect(anonText).not.toContain('ABB-PNL-16L-2026');
  });

  it('rejects unauthenticated access on all private user, vendor, and admin endpoints with 401', async () => {
    const privateGets = [
      '/api/v1/early-start/overview',
      '/api/v1/budget/overview',
      '/api/v1/my/hub',
      '/api/v1/my/documents',
      '/api/v1/shopping-lists',
      '/api/v1/rfq',
      '/api/v1/vendor-portal/overview',
      '/api/v1/admin/analytics',
      '/api/v1/wedding-day/overview',
      '/api/v1/home-care/overview',
      '/api/v1/financing-applications',
      '/api/v1/support-cases',
      '/api/v1/assistant/history',
    ];

    for (const endpoint of privateGets) {
      const res = await reqJson(endpoint);
      expect(res.status, `Expected 401 on anonymous GET ${endpoint}`).toBe(401);
    }
  });

  it('enforces partner consent isolation (Early Start, Private Docs & Home File stay strictly private post-link)', async () => {
    const karimLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    expect(karimLogin.status).toBe(200);
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    const saraLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    expect(saraLogin.status).toBe(200);
    const saraCookie = extractSessionCookie(saraLogin.setCookie);

    // Karim creates a strictly private document
    const privDocRes = await reqJson('/api/v1/my/documents', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        docType: 'id_copy',
        title: 'Karim Strictly Private Vault 2026',
        fileName: 'karim-private-statement.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 42000,
        isSharedWithPartner: false,
      }),
    });
    expect(privDocRes.status).toBe(201);

    // Before workspace link, Sara has zero access to Karim workspace or home file
    const saraPreHome = await reqJson<HomeFileOverviewPayload>('/api/v1/home-care/overview', {
      cookie: saraCookie,
    });
    expect(saraPreHome.status).toBe(200);
    expect(JSON.stringify(saraPreHome.body.data)).not.toContain('ABB-PNL-16L-2026');

    // Karim invites Sara and Sara accepts
    const inviteRes = await reqJson<{ inviteToken: string }>(
      '/api/v1/workspace/invite',
      {
        method: 'POST',
        cookie: karimCookie,
        body: JSON.stringify({
          inviteeIdentifier: 'sara@gawazinn.demo',
          proposedRole: 'partner',
          proposedSide: 'bride',
        }),
      },
    );
    expect(inviteRes.status).toBe(201);
    const inviteToken = inviteRes.body.data?.inviteToken;
    expect(inviteToken).toBeTruthy();

    const acceptRes = await reqJson<CoupleWorkspacePayload>(
      `/api/v1/workspace/invitations/${inviteToken}/accept`,
      { method: 'POST', cookie: saraCookie },
    );
    expect(acceptRes.status).toBe(200);

    // Post-link isolation: Early Start, Private Documents, and Digital Home File remain strictly owner-private!
    const saraEarlyStart = await reqJson<EarlyStartOverviewPayload>('/api/v1/early-start/overview', {
      cookie: saraCookie,
    });
    expect(saraEarlyStart.status).toBe(200);
    expect(JSON.stringify(saraEarlyStart.body.data)).not.toContain('Marriage & Furniture Target Fund');
    expect(JSON.stringify(saraEarlyStart.body.data)).not.toContain('صندوق الزواج والأثاث الكلي');

    const saraDocs = await reqJson<UserDocumentItem[]>('/api/v1/my/documents', {
      cookie: saraCookie,
    });
    expect(saraDocs.status).toBe(200);
    expect(
      (saraDocs.body.data || []).some((d) => d.title === 'Karim Strictly Private Vault 2026'),
    ).toBe(false);

    const saraPostHome = await reqJson<HomeFileOverviewPayload>('/api/v1/home-care/overview', {
      cookie: saraCookie,
    });
    expect(saraPostHome.status).toBe(200);
    expect(JSON.stringify(saraPostHome.body.data)).not.toContain('ABB-PNL-16L-2026');
    expect(JSON.stringify(saraPostHome.body.data)).not.toContain('Jotun 10678 Fenomastic My Home');
  });

  it('enforces RBAC role separation and masks Egyptian 14-digit National IDs on persistence', async () => {
    const karimLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'karim@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    const karimCookie = extractSessionCookie(karimLogin.setCookie);

    const modLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'mod@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    expect(modLogin.status).toBe(200);
    const modCookie = extractSessionCookie(modLogin.setCookie);

    const editorLogin = await reqJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'editor@gawazinn.demo', password: 'DemoPass@2026' }),
    });
    expect(editorLogin.status).toBe(200);
    const editorCookie = extractSessionCookie(editorLogin.setCookie);

    // Customer blocked from Admin analytics
    const custAdmin = await reqJson('/api/v1/admin/analytics', { cookie: karimCookie });
    expect(custAdmin.status).toBe(403);

    // Moderator blocked from Full Admin Expert verification and CMS Article edits
    const modVerifyExpert = await reqJson('/api/v1/admin/moderation/experts/exp-seed-pending/verify', {
      method: 'PATCH',
      cookie: modCookie,
      body: JSON.stringify({ status: 'verified', notes: 'Privilege escalation attempt' }),
    });
    expect(modVerifyExpert.status).toBe(403);

    // Editor blocked from suspending accounts
    const editorSuspend = await reqJson('/api/v1/admin/users/usr-2/status', {
      method: 'PATCH',
      cookie: editorCookie,
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(editorSuspend.status).toBe(403);

    // National ID masking check on financing submission
    const finRes = await reqJson<{ nationalId: string }>('/api/v1/financing-applications', {
      method: 'POST',
      cookie: karimCookie,
      body: JSON.stringify({
        customerName: 'كريم عبد العزيز',
        phone: '01012345678',
        nationalId: '29901011234567',
        monthlyIncome: 25000,
        employer: 'شركة هندسية',
        governorate: 'cairo',
        requestedAmount: 100000,
        tenureMonths: 24,
        preferredProvider: 'valU',
        associatedSection: 'finishing',
      }),
    });
    expect(finRes.status).toBe(201);
    expect(finRes.body.data?.nationalId).toBe('299********567');
    expect(JSON.stringify(finRes.body)).not.toContain('29901011234567');
  });
});

