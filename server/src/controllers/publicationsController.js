import * as Publications from '../models/publications.js';
import * as Categories from '../models/categories.js';

// ──────────────────────────────────────────────
// Público
// ──────────────────────────────────────────────

export async function listPublic(req, res) {
  try {
    const { category, page = 1, limit = 9 } = req.query;
    const result = await Publications.getAll({ category, page: Number(page), limit: Number(limit) });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getFeatured(req, res) {
  try {
    const data = await Publications.getFeatured();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getOne(req, res) {
  try {
    const pub = await Publications.getBySlug(req.params.slug);
    if (!pub) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json(pub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function listCategories(req, res) {
  try {
    const data = await Categories.getAll();
    res.json(data);
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
    const pub = await Publications.getById(Number(req.params.id));
    if (!pub) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json(pub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function listAdmin(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const result = await Publications.getAll({ status, page: Number(page), limit: Number(limit), adminMode: true });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function createOne(req, res) {
  try {
    const { title, subtitle, category_id, status, cover_image, body, published_at, artist_ids } = req.body;
    if (!title) return res.status(422).json({ error: 'El título es requerido' });
    const pub = await Publications.create({ title, subtitle, category_id, status, cover_image, body, published_at, artist_ids });
    res.status(201).json(pub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Publications.getById(id);
    if (!existing) return res.status(404).json({ error: 'Publicación no encontrada' });
    const pub = await Publications.update(id, req.body);
    res.json(pub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function deleteOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Publications.getById(id);
    if (!existing) return res.status(404).json({ error: 'Publicación no encontrada' });
    await Publications.remove(id);
    res.json({ message: 'Publicación eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function publishOne(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await Publications.publish(id);
    if (!result) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function unpublishOne(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await Publications.unpublish(id);
    if (!result) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
