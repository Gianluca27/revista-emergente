import * as Team from '../models/teamMembers.js';

// ── Público ─────────────────────────────────────
export async function listPublic(req, res) {
  try {
    const data = await Team.getAll();
    res.json(data);
  } catch (err) {
    console.error('[teamMembersController] listPublic error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// ── Admin (protegidas por authMiddleware) ───────
export async function getOneAdmin(req, res) {
  try {
    const id = Number(req.params.id);
    const member = await Team.getById(id);
    if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });
    res.json(member);
  } catch (err) {
    console.error('[teamMembersController] getOneAdmin error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function createOne(req, res) {
  try {
    const { name, role, bio, photo } = req.body;
    if (!name) return res.status(422).json({ error: 'El nombre es requerido' });
    const member = await Team.create({ name, role, bio, photo });
    res.status(201).json(member);
  } catch (err) {
    console.error('[teamMembersController] createOne error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Team.getById(id);
    if (!existing) return res.status(404).json({ error: 'Miembro no encontrado' });
    if (req.body.name !== undefined && !req.body.name) {
      return res.status(422).json({ error: 'El nombre es requerido' });
    }
    const updated = await Team.update(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('[teamMembersController] updateOne error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function deleteOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Team.getById(id);
    if (!existing) return res.status(404).json({ error: 'Miembro no encontrado' });
    await Team.remove(id);
    res.json({ message: 'Miembro eliminado' });
  } catch (err) {
    console.error('[teamMembersController] deleteOne error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function reorderAll(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(n => Number.isInteger(n))) {
      return res.status(400).json({ error: 'ids debe ser un array de enteros' });
    }
    await Team.reorder(ids);
    const data = await Team.getAll();
    res.json(data);
  } catch (err) {
    console.error('[teamMembersController] reorderAll error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
