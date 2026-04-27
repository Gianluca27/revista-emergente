import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { Client } = pg;

async function run() {
  // Step 1: Connect as postgres superuser to create user + db
  const admin = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    database: 'postgres',
  });

  await admin.connect();
  console.log('Connected as postgres.');

  try {
    await admin.query(`CREATE USER emergente_user WITH PASSWORD 'emergente_dev_2026'`);
    console.log('User emergente_user created.');
  } catch (e) {
    if (e.code === '42710') console.log('User already exists, skipping.');
    else throw e;
  }

  try {
    await admin.query(`CREATE DATABASE emergente_db OWNER emergente_user`);
    console.log('Database emergente_db created.');
  } catch (e) {
    if (e.code === '42P04') console.log('Database already exists, skipping.');
    else throw e;
  }

  await admin.end();

  // Step 2: Connect to emergente_db and run migrations
  const db = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    database: 'emergente_db',
  });

  await db.connect();
  console.log('Connected to emergente_db.');

  const schema = readFileSync(resolve(__dirname, '../migrations/001_initial_schema.sql'), 'utf8');
  await db.query(schema);
  console.log('Migration 001_initial_schema.sql applied.');

  const seed = readFileSync(resolve(__dirname, '../migrations/002_seed_categories.sql'), 'utf8');
  try {
    await db.query(seed);
    console.log('Seed 002_seed_categories.sql applied.');
  } catch (e) {
    if (e.code === '23505') console.log('Categories already seeded, skipping.');
    else throw e;
  }

  // Grant privileges to emergente_user
  await db.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emergente_user`);
  await db.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emergente_user`);
  await db.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO emergente_user`);
  await db.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO emergente_user`);
  console.log('Privileges granted to emergente_user.');

  await db.end();
  console.log('\nDone. Database ready.');
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
