import pool from '../services/db.js';

const BASE_SELECT = `
  SELECT
    p.id, p.slug, p.title, p.subtitle, p.status,
    p.cover_image, p.body, p.published_at, p.created_at, p.updated_at,
    json_build_object('id', c.id, 'slug', c.slug, 'name', c.name) AS category
  FROM publications p
  LEFT JOIN categories c ON c.id = p.category_id
`;

const ARTIST_SELECT = `
  SELECT
    a.id, a.name, a.slug, a.bio, a.photo,
    a.instagram_url, a.spotify_url, a.youtube_url, a.soundcloud_url
  FROM artists a
  JOIN publication_artists pa ON pa.artist_id = a.id
  WHERE pa.publication_id = $1
`;

export async function getAll({ status, category, page = 1, limit = 9, adminMode = false }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`p.status = $${values.length}`);
  } else if (!adminMode) {
    conditions.push(`p.status = 'published'`);
  }

  if (category) {
    values.push(category);
    conditions.push(`c.slug = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM publications p LEFT JOIN categories c ON c.id = p.category_id ${where}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  values.push(limit);
  values.push(offset);
  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY p.published_at DESC NULLS LAST LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    data: rows,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getFeatured() {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE p.status = 'published' ORDER BY p.published_at DESC NULLS LAST LIMIT 3`
  );
  return rows;
}

export async function getBySlug(slug, { onlyPublished = true } = {}) {
  const condition = onlyPublished ? `WHERE p.slug = $1 AND p.status = 'published'` : `WHERE p.slug = $1`;
  const { rows } = await pool.query(`${BASE_SELECT} ${condition}`, [slug]);
  if (!rows.length) return null;

  const pub = rows[0];
  const { rows: artists } = await pool.query(ARTIST_SELECT, [pub.id]);
  pub.artists = artists;
  return pub;
}

export async function getById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE p.id = $1`, [id]);
  if (!rows.length) return null;
  const pub = rows[0];
  const { rows: artists } = await pool.query(ARTIST_SELECT, [pub.id]);
  pub.artists = artists;
  return pub;
}

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
      ? `SELECT id FROM publications WHERE slug = $1 AND id != $2`
      : `SELECT id FROM publications WHERE slug = $1`;
    const params = excludeId ? [slug, excludeId] : [slug];
    const { rows } = await pool.query(query, params);
    if (!rows.length) return slug;
    slug = `${baseSlug}-${i++}`;
  }
}

async function syncArtists(client, publicationId, artistIds) {
  await client.query(`DELETE FROM publication_artists WHERE publication_id = $1`, [publicationId]);
  if (!artistIds?.length) return;
  const values = artistIds.map((aid, i) => `($1, $${i + 2})`).join(', ');
  await client.query(
    `INSERT INTO publication_artists (publication_id, artist_id) VALUES ${values}`,
    [publicationId, ...artistIds]
  );
}

export async function create({ title, subtitle, category_id, status = 'draft', cover_image, body, published_at, artist_ids }) {
  const baseSlug = slugify(title);
  const slug = await uniqueSlug(baseSlug);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO publications (slug, title, subtitle, category_id, status, cover_image, body, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, slug`,
      [slug, title, subtitle ?? null, category_id ?? null, status, cover_image ?? null, body ?? null, published_at ?? null]
    );
    const { id } = rows[0];
    await syncArtists(client, id, artist_ids);
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function update(id, fields) {
  const { title, subtitle, category_id, status, cover_image, body, published_at, artist_ids } = fields;

  const setClauses = [];
  const values = [];

  if (title !== undefined) { values.push(title); setClauses.push(`title = $${values.length}`); }
  if (subtitle !== undefined) { values.push(subtitle); setClauses.push(`subtitle = $${values.length}`); }
  if (category_id !== undefined) { values.push(category_id); setClauses.push(`category_id = $${values.length}`); }
  if (status !== undefined) { values.push(status); setClauses.push(`status = $${values.length}`); }
  if (cover_image !== undefined) { values.push(cover_image); setClauses.push(`cover_image = $${values.length}`); }
  if (body !== undefined) { values.push(body); setClauses.push(`body = $${values.length}`); }
  if (published_at !== undefined) { values.push(published_at); setClauses.push(`published_at = $${values.length}`); }

  if (title) {
    const baseSlug = slugify(title);
    const slug = await uniqueSlug(baseSlug, id);
    values.push(slug);
    setClauses.push(`slug = $${values.length}`);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (setClauses.length > 1) {
      await client.query(
        `UPDATE publications SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }

    if (artist_ids !== undefined) {
      await syncArtists(client, id, artist_ids);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getById(id);
}

export async function remove(id) {
  await pool.query(`DELETE FROM publications WHERE id = $1`, [id]);
}

export async function publish(id) {
  const { rows } = await pool.query(
    `UPDATE publications
     SET status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW()
     WHERE id = $1
     RETURNING id, status, published_at`,
    [id]
  );
  return rows[0] ?? null;
}

export async function unpublish(id) {
  const { rows } = await pool.query(
    `UPDATE publications SET status = 'draft', updated_at = NOW() WHERE id = $1 RETURNING id, status`,
    [id]
  );
  return rows[0] ?? null;
}
