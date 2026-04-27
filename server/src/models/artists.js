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
      ? `SELECT id FROM artists WHERE slug = $1 AND id != $2`
      : `SELECT id FROM artists WHERE slug = $1`;
    const params = excludeId ? [slug, excludeId] : [slug];
    const { rows } = await pool.query(query, params);
    if (!rows.length) return slug;
    slug = `${baseSlug}-${i++}`;
  }
}

export async function getAll() {
  const { rows } = await pool.query(
    `SELECT id, name, slug, photo, instagram_url FROM artists ORDER BY name ASC`
  );
  return rows;
}

export async function getBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT id, name, slug, bio, photo, instagram_url, spotify_url, youtube_url, soundcloud_url, created_at
     FROM artists WHERE slug = $1`,
    [slug]
  );
  if (!rows.length) return null;

  const artist = rows[0];
  const { rows: publications } = await pool.query(
    `SELECT p.id, p.slug, p.title, p.cover_image, p.published_at
     FROM publications p
     JOIN publication_artists pa ON pa.publication_id = p.id
     WHERE pa.artist_id = $1 AND p.status = 'published'
     ORDER BY p.published_at DESC`,
    [artist.id]
  );
  artist.publications = publications;
  return artist;
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, slug, bio, photo, instagram_url, spotify_url, youtube_url, soundcloud_url, created_at
     FROM artists WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ name, bio, photo, instagram_url, spotify_url, youtube_url, soundcloud_url }) {
  const baseSlug = slugify(name);
  const slug = await uniqueSlug(baseSlug);

  const { rows } = await pool.query(
    `INSERT INTO artists (name, slug, bio, photo, instagram_url, spotify_url, youtube_url, soundcloud_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, slug`,
    [name, slug, bio ?? null, photo ?? null, instagram_url ?? null, spotify_url ?? null, youtube_url ?? null, soundcloud_url ?? null]
  );
  return rows[0];
}

export async function update(id, fields) {
  const { name, bio, photo, instagram_url, spotify_url, youtube_url, soundcloud_url } = fields;

  const setClauses = [];
  const values = [];

  if (name !== undefined) { values.push(name); setClauses.push(`name = $${values.length}`); }
  if (bio !== undefined) { values.push(bio); setClauses.push(`bio = $${values.length}`); }
  if (photo !== undefined) { values.push(photo); setClauses.push(`photo = $${values.length}`); }
  if (instagram_url !== undefined) { values.push(instagram_url); setClauses.push(`instagram_url = $${values.length}`); }
  if (spotify_url !== undefined) { values.push(spotify_url); setClauses.push(`spotify_url = $${values.length}`); }
  if (youtube_url !== undefined) { values.push(youtube_url); setClauses.push(`youtube_url = $${values.length}`); }
  if (soundcloud_url !== undefined) { values.push(soundcloud_url); setClauses.push(`soundcloud_url = $${values.length}`); }

  if (name !== undefined) {
    const baseSlug = slugify(name);
    const slug = await uniqueSlug(baseSlug, id);
    values.push(slug);
    setClauses.push(`slug = $${values.length}`);
  }

  if (setClauses.length) {
    values.push(id);
    await pool.query(
      `UPDATE artists SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );
  }

  return getById(id);
}

export async function remove(id) {
  await pool.query(`DELETE FROM artists WHERE id = $1`, [id]);
}
