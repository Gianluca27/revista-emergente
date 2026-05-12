import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listPublic, getOneAdmin, createOne, updateOne, deleteOne, reorderAll,
} from '../controllers/teamMembersController.js';

const router = Router();

// Público
router.get('/team', listPublic);

// Admin — '/admin/team/reorder' DEBE ir antes de '/admin/team/:id'
router.patch('/admin/team/reorder', requireAuth, reorderAll);
router.get('/admin/team/:id', requireAuth, getOneAdmin);
router.post('/admin/team', requireAuth, createOne);
router.put('/admin/team/:id', requireAuth, updateOne);
router.delete('/admin/team/:id', requireAuth, deleteOne);

export default router;
