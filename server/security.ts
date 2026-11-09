import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `${salt}:${derived.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    const expected = Buffer.from(expectedHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function hashSensitiveField(value: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

export const SESSION_COOKIE_NAME = 'gawazinn_session';

export function buildSessionCookieHeader(
  token: string,
  maxAgeSeconds: number,
  isProduction: boolean,
): string {
  const attrs = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
  ];
  if (isProduction) {
    attrs.push('Secure');
  }
  return attrs.join('; ');
}

export function buildClearSessionCookieHeader(isProduction: boolean): string {
  return buildSessionCookieHeader('', 0, isProduction);
}

interface RateBucket {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private readonly buckets = new Map<string, RateBucket>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const bucket = this.buckets.get(key) || { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);
    if (bucket.timestamps.length >= this.maxRequests) {
      const oldest = bucket.timestamps[0] || now;
      const retryMs = Math.max(1000, this.windowMs - (now - oldest));
      this.buckets.set(key, bucket);
      return { allowed: false, retryAfterSeconds: Math.ceil(retryMs / 1000) };
    }
    bucket.timestamps.push(now);
    this.buckets.set(key, bucket);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

export function writeAuditLog(
  db: DatabaseSync,
  params: {
    actorUserId?: string | null;
    actorRole: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    metadata?: Record<string, unknown>;
    ipAddress?: string | null;
  },
): void {
  const id = `aud-${crypto.randomUUID().slice(0, 12)}`;
  db.prepare(
    `INSERT INTO audit_logs (id, actor_user_id, actor_role, action, target_type, target_id, metadata_json, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    params.actorUserId ?? null,
    params.actorRole,
    params.action,
    params.targetType,
    params.targetId ?? null,
    JSON.stringify(params.metadata ?? {}),
    params.ipAddress ?? null,
    new Date().toISOString(),
  );
}

