import { loadConfig } from './config';
import { openDatabase, runMigrations } from './db';
import { seedDatabase } from './seed';

const config = loadConfig();
const db = openDatabase(config.sqlitePath);
runMigrations(db);
const result = seedDatabase(db, config.sessionSecret);
console.log(
  result.seeded
    ? 'Seeded GAWAZ INN 2.0 baseline database successfully.'
    : 'Database already contains records; seed skipped.',
);
db.close();

