import pg from 'pg';

const { Client } = pg;

const db = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'emergente_user',
  password: 'emergente_dev_2026',
  database: 'emergente_db',
});

await db.connect();

const tables = await db.query(`
  SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
`);
console.log('Tables:', tables.rows.map(r => r.tablename).join(', '));

const cats = await db.query('SELECT slug, name FROM categories ORDER BY id');
console.log('Categories:', cats.rows.map(r => `${r.slug}/${r.name}`).join(', '));

await db.end();
