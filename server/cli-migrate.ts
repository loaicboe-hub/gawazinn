import { loadConfig } from './config';
import { openDatabase, runMigrations } from './db';

const config = loadConfig();
const db = openDatabase(config.sqlitePath);
const applied = runMigrations(db);
console.log(
  applied.length > 0
    ? `Applied SQLite migrations: ${applied.join(', ')}`
    : 'Database schema is up to date.',
);
db.close();

