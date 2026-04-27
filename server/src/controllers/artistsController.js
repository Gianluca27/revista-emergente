import * as Artists from '../models/artists.js';

// ──────────────────────────────────────────────
// Público
// ──────────────────────────────────────────────

export async function listPublic(req, res) {
  try {
    const data = await Artists.getAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getOne(req, res) {
  try {
    const artist = await Artists.getBySlug(req.params.slug);
    if (!artist) return res.status(404).json({ error: 'Artista no encontrado' });
    res.json(artist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// ──────────────────────────────────────────────
// Admin (protegidas por authMiddleware)
// ──────────────────────────────────────────────

export async function getOneAdmin(req, res) {
  try {
    const id = Number(req.params.id);
    const artist = await Artists.getById(id);
    if (!artist) return res.status(404).json({ error: 'Artista no encontrado' });
    res.json(artist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function createOne(req, res) {
  try {
    const { name, bio, photo, instagram_url, spotify_url, youtube_url, soundcloud_url } = req.body;
    if (!name) return res.status(422).json({ error: 'El nombre es requerido' });
    const artist = await Artists.create({ name, bio, photo, instagram_url, spotify_url, youtube_url, soundcloud_url });
    res.status(201).json(artist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Artists.getById(id);
    if (!existing) return res.status(404).json({ error: 'Artista no encontrado' });
    const updated = await Artists.update(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function deleteOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Artists.getById(id);
    if (!existing) return res.status(404).json({ error: 'Artista no encontrado' });
    await Artists.remove(id);
    res.json({ message: 'Artista eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
