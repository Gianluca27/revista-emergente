import * as Podcast from '../models/podcast.js';

// ──────────────────────────────────────────────
// Público
// ──────────────────────────────────────────────

export async function listPublic(req, res) {
  try {
    const episodes = await Podcast.getAll();
    res.json(episodes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getOne(req, res) {
  try {
    const episode = await Podcast.getById(Number(req.params.id));
    if (!episode) return res.status(404).json({ error: 'Episodio no encontrado' });
    res.json(episode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// ──────────────────────────────────────────────
// Admin (protegidas por authMiddleware)
// ──────────────────────────────────────────────

export async function listAdmin(req, res) {
  try {
    const episodes = await Podcast.getAllAdmin();
    res.json(episodes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getOneAdmin(req, res) {
  try {
    const episode = await Podcast.getById(Number(req.params.id));
    if (!episode) return res.status(404).json({ error: 'Episodio no encontrado' });
    res.json(episode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function createOne(req, res) {
  try {
    const {
      title,
      description,
      cover_image,
      spotify_url,
      youtube_url,
      duration_min,
      episode_number,
      status,
    } = req.body;

    if (!title) return res.status(422).json({ error: 'El título es requerido' });

    const result = await Podcast.create({
      title,
      description,
      cover_image,
      spotify_url,
      youtube_url,
      duration_min,
      episode_number,
      status,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Podcast.getById(id);
    if (!existing) return res.status(404).json({ error: 'Episodio no encontrado' });

    const updated = await Podcast.update(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function deleteOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Podcast.getById(id);
    if (!existing) return res.status(404).json({ error: 'Episodio no encontrado' });

    await Podcast.remove(id);
    res.json({ message: 'Episodio eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
