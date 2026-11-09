import http from 'node:http';
import { loadConfig } from './config';
import { openDatabase, runMigrations } from './db';
import { seedDatabase } from './seed';
import { createAppHandler } from './app';

const config = loadConfig();
const db = openDatabase(config.sqlitePath);
runMigrations(db);
seedDatabase(db, config.sessionSecret);

const handler = createAppHandler(db, {
  sessionSecret: config.sessionSecret,
  appOrigin: config.appOrigin,
  sessionTtlSeconds: config.sessionTtlSeconds,
  isProduction: config.nodeEnv === 'production',
});

const server = http.createServer((req, res) => {
  void handler(req, res);
});

server.listen(config.port, config.host, () => {
  console.log(`GAWAZ INN 2.0 API listening on http://${config.host}:${config.port} (SQLite: ${config.sqlitePath})`);
});

