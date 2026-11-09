import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadConfig } from '../server/config';
import { openDatabase, runMigrations } from '../server/db';
import { seedDatabase } from '../server/seed';
import { createAppHandler } from '../server/app';

/**
 * Vercel Serverless adapter entry.
 * Note: For durable multi-user Vercel production storage, set DB_DRIVER=postgres & DATABASE_URL
 * pointing to Supabase / Neon using db/migrations/postgres/*.sql.
 */
let cachedHandler: ((req: IncomingMessage, res: ServerResponse) => Promise<void>) | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let fn = cachedHandler;
  if (!fn) {
    const config = loadConfig();
    const sqlitePath = process.env.VERCEL ? '/tmp/gawazinn.db' : config.sqlitePath;
    const db = openDatabase(sqlitePath);
    runMigrations(db);
    seedDatabase(db, config.sessionSecret);
    fn = createAppHandler(db, {
      sessionSecret: config.sessionSecret,
      appOrigin: config.appOrigin,
      sessionTtlSeconds: config.sessionTtlSeconds,
      isProduction: config.nodeEnv === 'production',
    });
    cachedHandler = fn;
  }
  return fn(req, res);
}
