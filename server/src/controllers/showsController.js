import * as Shows from '../models/shows.js';

// ──────────────────────────────────────────────
// Público
// ──────────────────────────────────────────────

export async function listPublic(req, res) {
  try {
    const data = await Shows.getAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getOne(req, res) {
  try {
    const show = await Shows.getBySlug(req.params.slug);
    if (!show) return res.status(404).json({ error: 'Cobertura no encontrada' });
    res.json(show);
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
    const data = await Shows.getAllAdmin();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getOneAdmin(req, res) {
  try {
    const id = Number(req.params.id);
    const show = await Shows.getById(id);
    if (!show) return res.status(404).json({ error: 'Cobertura no encontrada' });
    res.json(show);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function createOne(req, res) {
  try {
    const { title, venue, event_date, description, cover_image, gallery, status } = req.body;
    if (!title) return res.status(422).json({ error: 'El título es requerido' });

    const galleryArr = Array.isArray(gallery) ? gallery : [];
    const show = await Shows.create({ title, venue, event_date, description, cover_image, gallery: galleryArr, status });
    res.status(201).json(show);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Shows.getById(id);
    if (!existing) return res.status(404).json({ error: 'Cobertura no encontrada' });

    if (req.body.gallery !== undefined && !Array.isArray(req.body.gallery)) {
      return res.status(422).json({ error: 'gallery debe ser un array' });
    }

    const updated = await Shows.update(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function deleteOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Shows.getById(id);
    if (!existing) return res.status(404).json({ error: 'Cobertura no encontrada' });
    await Shows.remove(id);
    res.json({ message: 'Cobertura eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
