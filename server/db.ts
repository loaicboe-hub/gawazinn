import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { EMBEDDED_MIGRATIONS } from './embeddedMigrations';

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

  let migrationItems: Array<{ name: string; sql: string }> = [];

  if (fs.existsSync(migrationsDir)) {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();
    migrationItems = files.map((file) => ({
      name: file,
      sql: fs.readFileSync(path.join(migrationsDir, file), 'utf8'),
    }));
  }

  if (migrationItems.length === 0) {
    migrationItems = EMBEDDED_MIGRATIONS;
  }

  const applied: string[] = [];

  for (const item of migrationItems) {
    const existing = db
      .prepare('SELECT name FROM _migrations WHERE name = ?')
      .get(item.name) as { name: string } | undefined;

    if (existing) continue;

    db.exec('BEGIN;');
    try {
      db.exec(item.sql);
      db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run(
        item.name,
        new Date().toISOString(),
      );
      db.exec('COMMIT;');
      applied.push(item.name);
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }

  return applied;
}

