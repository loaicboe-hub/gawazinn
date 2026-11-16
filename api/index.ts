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
  try {
    let fn = cachedHandler;
    if (!fn) {
      const config = loadConfig();
      const sqlitePath = process.env.VERCEL ? '/tmp/gawazinn.db' : config.sqlitePath;
      const db = openDatabase(sqlitePath);
      runMigrations(db);
      seedDatabase(db, config.sessionSecret);
      fn = createAppHandler(db, {
        sessionSecret: config.sessionSecret,
        appOrigin: config.appOrigin || 'https://gawazinn.vercel.app',
        sessionTtlSeconds: config.sessionTtlSeconds,
        isProduction: true,
      });
      cachedHandler = fn;
    }
    return await fn(req, res);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Vercel serverless error:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
    });
    res.end(
      JSON.stringify({
        ok: false,
        error: {
          code: 'SERVERLESS_FUNCTION_ERROR',
          message: error.message || 'Internal Server Error',
        },
      }),
    );
  }
}
