import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_MIGRATIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
  'migrations'
);

export async function runMigrations(pool, migrationsDir = DEFAULT_MIGRATIONS_DIR) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename  TEXT PRIMARY KEY,
      ran_at    TIMESTAMP DEFAULT NOW()
    )
  `);

  const files = (await fs.readdir(migrationsDir))
    .filter(f => f.endsWith('.sql'))
    .sort();

  const { rows } = await pool.query('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map(r => r.filename));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] skip  ${file}`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations(filename) VALUES($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`[migrate] ran   ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration failed [${file}]: ${err.message}`);
    } finally {
      client.release();
    }
  }
}
