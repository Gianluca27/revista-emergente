import pool from '../services/db.js';

const COLS = 'id, name, role, bio, photo, position';

export async function getAll() {
  const { rows } = await pool.query(
    `SELECT ${COLS} FROM team_members ORDER BY position ASC, id ASC`
  );
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLS} FROM team_members WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ name, role, bio, photo }) {
  const { rows } = await pool.query(
    `INSERT INTO team_members (name, role, bio, photo, position)
     VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(position), -1) + 1 FROM team_members))
     RETURNING ${COLS}`,
    [name, role ?? null, bio ?? null, photo ?? null]
  );
  return rows[0];
}

export async function update(id, fields) {
  const { name, role, bio, photo } = fields;
  const setClauses = [];
  const values = [];
  if (name  !== undefined) { values.push(name);  setClauses.push(`name = $${values.length}`); }
  if (role  !== undefined) { values.push(role);  setClauses.push(`role = $${values.length}`); }
  if (bio   !== undefined) { values.push(bio);   setClauses.push(`bio = $${values.length}`); }
  if (photo !== undefined) { values.push(photo); setClauses.push(`photo = $${values.length}`); }

  if (setClauses.length) {
    values.push(id);
    await pool.query(
      `UPDATE team_members SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );
  }
  return getById(id);
}

export async function remove(id) {
  await pool.query('DELETE FROM team_members WHERE id = $1', [id]);
}

export async function reorder(orderedIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query('UPDATE team_members SET position = $1 WHERE id = $2', [i, orderedIds[i]]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
