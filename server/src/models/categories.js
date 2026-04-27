import pool from '../services/db.js';

export async function getAll() {
  const { rows } = await pool.query(`SELECT id, slug, name FROM categories ORDER BY id`);
  return rows;
}
