import pool from '../services/db.js';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let i = 1;
  while (true) {
    const query = excludeId
      ? `SELECT id FROM shows WHERE slug = $1 AND id != $2`
      : `SELECT id FROM shows WHERE slug = $1`;
    const params = excludeId ? [slug, excludeId] : [slug];
    const { rows } = await pool.query(query, params);
    if (!rows.length) return slug;
    slug = `${baseSlug}-${i++}`;
  }
}

export async function getAll() {
  const { rows } = await pool.query(
    `SELECT id, title, slug, venue, event_date, cover_image, created_at
     FROM shows
     WHERE status = 'published'
     ORDER BY event_date DESC`
  );
  return rows;
}

export async function getAllAdmin() {
  const { rows } = await pool.query(
    `SELECT id, title, slug, venue, event_date, cover_image, status, created_at
     FROM shows
     ORDER BY event_date DESC NULLS LAST, created_at DESC`
  );
  return rows;
}

export async function getBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT id, title, slug, venue, event_date, description, cover_image, gallery, status, created_at
     FROM shows
     WHERE slug = $1 AND status = 'published'`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT id, title, slug, venue, event_date, description, cover_image, gallery, status, created_at
     FROM shows
     WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ title, venue, event_date, description, cover_image, gallery, status }) {
  const baseSlug = slugify(title);
  const slug = await uniqueSlug(baseSlug);

  const { rows } = await pool.query(
    `INSERT INTO shows (title, slug, venue, event_date, description, cover_image, gallery, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
     RETURNING id, slug`,
    [
      title,
      slug,
      venue ?? null,
      event_date ?? null,
      description ?? null,
      cover_image ?? null,
      JSON.stringify(gallery ?? []),
      status ?? 'draft',
    ]
  );
  return rows[0];
}

export async function update(id, fields) {
  const { title, venue, event_date, description, cover_image, gallery, status } = fields;

  const setClauses = [];
  const values = [];

  if (title !== undefined) {
    values.push(title);
    setClauses.push(`title = $${values.length}`);

    const baseSlug = slugify(title);
    const slug = await uniqueSlug(baseSlug, id);
    values.push(slug);
    setClauses.push(`slug = $${values.length}`);
  }
  if (venue !== undefined)       { values.push(venue);       setClauses.push(`venue = $${values.length}`); }
  if (event_date !== undefined)  { values.push(event_date);  setClauses.push(`event_date = $${values.length}`); }
  if (description !== undefined) { values.push(description); setClauses.push(`description = $${values.length}`); }
  if (cover_image !== undefined) { values.push(cover_image); setClauses.push(`cover_image = $${values.length}`); }
  if (gallery !== undefined) {
    values.push(JSON.stringify(gallery));
    setClauses.push(`gallery = $${values.length}::jsonb`);
  }
  if (status !== undefined) { values.push(status); setClauses.push(`status = $${values.length}`); }

  if (setClauses.length) {
    values.push(id);
    await pool.query(
      `UPDATE shows SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );
  }

  return getById(id);
}

export async function remove(id) {
  await pool.query(`DELETE FROM shows WHERE id = $1`, [id]);
}
