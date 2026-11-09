import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function openDatabase(sqlitePath: string): DatabaseSync {
  if (sqlitePath !== ':memory:') {
    const dir = path.dirname(sqlitePath);
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(sqlitePath);
  db.exec('PRAGMA foreign_keys = ON;');
  if (sqlitePath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }
  db.exec('PRAGMA busy_timeout = 5000;');
  return db;
}

export function runMigrations(
  db: DatabaseSync,
  migrationsDir = path.resolve(process.cwd(), 'db', 'migrations', 'sqlite'),
): string[] {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const applied: string[] = [];

  for (const file of files) {
    const existing = db
      .prepare('SELECT name FROM _migrations WHERE name = ?')
      .get(file) as { name: string } | undefined;

    if (existing) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec('BEGIN;');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run(
        file,
        new Date().toISOString(),
      );
      db.exec('COMMIT;');
      applied.push(file);
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }

  return applied;
}

