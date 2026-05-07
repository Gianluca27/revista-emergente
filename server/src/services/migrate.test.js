import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: new URL('../../..', import.meta.url).pathname + '/.env' });

const { Pool } = pg;
let pool;
let runMigrations;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '__fixtures__');

before(async () => {
  // Try to import the migrate module - this should fail with "Cannot find module"
  // if migrate.js doesn't exist yet
  try {
    const migrate = await import('./migrate.js');
    runMigrations = migrate.runMigrations;
  } catch (error) {
    console.error('Module import error:', error.message);
    throw error;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 5000,
  });
  try {
    await pool.query('DROP TABLE IF EXISTS schema_migrations');
    // Drop fixture tables if they exist from a previous failed run
    await pool.query('DROP TABLE IF EXISTS _test_alpha');
    await pool.query('DROP TABLE IF EXISTS _test_beta');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    await pool.end();
    throw error;
  }
});

after(async () => {
  if (pool) {
    try {
      await pool.query('DROP TABLE IF EXISTS schema_migrations');
      await pool.query('DROP TABLE IF EXISTS _test_alpha');
      await pool.query('DROP TABLE IF EXISTS _test_beta');
      await pool.end();
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }
});

test('creates schema_migrations table on first run', async () => {
  await runMigrations(pool, FIXTURES_DIR);

  const { rows } = await pool.query(
    "SELECT to_regclass('schema_migrations') AS tbl"
  );
  assert.ok(rows[0].tbl, 'schema_migrations table should exist');
});

test('runs pending SQL files in filename order', async () => {
  const { rows } = await pool.query(
    'SELECT filename FROM schema_migrations ORDER BY filename'
  );
  const names = rows.map(r => r.filename);
  assert.deepEqual(names, ['001_test_alpha.sql', '002_test_beta.sql']);

  // Verify the tables created by fixtures actually exist
  const a = await pool.query("SELECT to_regclass('_test_alpha') AS tbl");
  assert.ok(a.rows[0].tbl);
  const b = await pool.query("SELECT to_regclass('_test_beta') AS tbl");
  assert.ok(b.rows[0].tbl);
});

test('skips already-applied migrations on second run', async () => {
  // Should not throw even though tables already exist — because SQL is not re-run
  await assert.doesNotReject(runMigrations(pool, FIXTURES_DIR));

  const { rows } = await pool.query('SELECT COUNT(*) FROM schema_migrations');
  assert.equal(rows[0].count, '2', 'still only 2 rows after second run');
});
