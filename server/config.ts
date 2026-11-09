import path from 'node:path';

export interface ServerConfig {
  nodeEnv: string;
  port: number;
  host: string;
  sqlitePath: string;
  sessionSecret: string;
  appOrigin: string;
  sessionTtlSeconds: number;
}

export function loadConfig(): ServerConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '127.0.0.1';
  const sqlitePath =
    process.env.SQLITE_PATH ||
    path.resolve(process.cwd(), '.data', 'gawazinn.db');
  const sessionSecret =
    process.env.SESSION_SECRET || 'gawazinn-dev-local-secret-change-in-production';
  const appOrigin = process.env.APP_ORIGIN || 'http://localhost:3000';
  const sessionTtlSeconds = 60 * 60 * 24 * 14; // 14 days

  return {
    nodeEnv,
    port,
    host,
    sqlitePath,
    sessionSecret,
    appOrigin,
    sessionTtlSeconds,
  };
}

