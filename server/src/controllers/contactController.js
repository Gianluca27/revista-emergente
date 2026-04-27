import * as Contact from '../models/contact.js';

const VALID_STATUSES = ['pending', 'read', 'archived'];

/**
 * PUBLIC — POST /contact
 * Validates required fields and creates a new contact request.
 */
export async function submit(req, res) {
  try {
    const { name, email, message, project_name, instagram } = req.body;

    if (!name || !email || !message) {
      return res.status(422).json({ error: 'nombre, email y mensaje son requeridos' });
    }

    await Contact.create({ name, email, project_name, message, instagram });

    return res.status(201).json({
      message: 'Solicitud enviada. Te contactaremos a la brevedad.',
    });
  } catch (err) {
    console.error('[contactController] submit error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * ADMIN — GET /admin/contact
 * Returns all contact requests, optionally filtered by ?status=
 */
export async function listAdmin(req, res) {
  try {
    const { status } = req.query;
    const rows = await Contact.getAll({ status });
    return res.json(rows);
  } catch (err) {
    console.error('[contactController] listAdmin error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * ADMIN — PATCH /admin/contact/:id/status
 * Updates the status of a contact request.
 */
export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const updated = await Contact.updateStatus(id, status);

    if (!updated) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    return res.json(updated);
  } catch (err) {
    console.error('[contactController] updateStatus error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
