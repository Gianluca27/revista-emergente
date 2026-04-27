import pool from '../services/db.js';

const BASE_SELECT = `
  SELECT
    id, title, description, cover_image,
    spotify_url, youtube_url, duration_min,
    episode_number, published_at, status, created_at
  FROM podcast_episodes
`;

export async function getAll() {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE status = 'published' ORDER BY episode_number DESC`
  );
  return rows;
}

export async function getAllAdmin() {
  const { rows } = await pool.query(
    `${BASE_SELECT} ORDER BY episode_number DESC NULLS LAST, created_at DESC`
  );
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({
  title,
  description,
  cover_image,
  spotify_url,
  youtube_url,
  duration_min,
  episode_number,
  status = 'draft',
}) {
  const { rows } = await pool.query(
    `INSERT INTO podcast_episodes
       (title, description, cover_image, spotify_url, youtube_url, duration_min, episode_number, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      title,
      description ?? null,
      cover_image ?? null,
      spotify_url ?? null,
      youtube_url ?? null,
      duration_min ?? null,
      episode_number ?? null,
      status,
    ]
  );
  return rows[0];
}

export async function update(id, fields) {
  const {
    title,
    description,
    cover_image,
    spotify_url,
    youtube_url,
    duration_min,
    episode_number,
    status,
  } = fields;

  const setClauses = [];
  const values = [];

  if (title !== undefined)          { values.push(title);          setClauses.push(`title = $${values.length}`); }
  if (description !== undefined)    { values.push(description);    setClauses.push(`description = $${values.length}`); }
  if (cover_image !== undefined)    { values.push(cover_image);    setClauses.push(`cover_image = $${values.length}`); }
  if (spotify_url !== undefined)    { values.push(spotify_url);    setClauses.push(`spotify_url = $${values.length}`); }
  if (youtube_url !== undefined)    { values.push(youtube_url);    setClauses.push(`youtube_url = $${values.length}`); }
  if (duration_min !== undefined)   { values.push(duration_min);   setClauses.push(`duration_min = $${values.length}`); }
  if (episode_number !== undefined) { values.push(episode_number); setClauses.push(`episode_number = $${values.length}`); }
  if (status !== undefined)         { values.push(status);         setClauses.push(`status = $${values.length}`); }

  if (setClauses.length > 0) {
    values.push(id);
    await pool.query(
      `UPDATE podcast_episodes SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );
  }

  return getById(id);
}

export async function remove(id) {
  await pool.query(`DELETE FROM podcast_episodes WHERE id = $1`, [id]);
}
