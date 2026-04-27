import pool from '../services/db.js';

/**
 * Returns all contact requests, optionally filtered by status.
 * @param {{ status?: string }} options
 */
export async function getAll({ status } = {}) {
  if (status) {
    const result = await pool.query(
      'SELECT * FROM contact_requests WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  }

  const result = await pool.query(
    'SELECT * FROM contact_requests ORDER BY created_at DESC'
  );
  return result.rows;
}

/**
 * Inserts a new contact request with status 'pending'.
 * @param {{ name: string, email: string, project_name?: string, message: string, instagram?: string }} data
 * @returns {{ id: number }}
 */
export async function create({ name, email, project_name, message, instagram }) {
  const result = await pool.query(
    `INSERT INTO contact_requests (name, email, project_name, message, instagram, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id`,
    [name, email, project_name ?? null, message, instagram ?? null]
  );
  return { id: result.rows[0].id };
}

/**
 * Updates the status of a contact request by id.
 * @param {number|string} id
 * @param {string} status
 * @returns {object|null} Updated row, or null if not found.
 */
export async function updateStatus(id, status) {
  const result = await pool.query(
    'UPDATE contact_requests SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] ?? null;
}
