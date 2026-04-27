import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listPublic,
  getOne,
  listAdmin,
  getOneAdmin,
  createOne,
  updateOne,
  deleteOne,
} from '../controllers/podcastController.js';

const router = Router();

// Público
router.get('/podcast', listPublic);
router.get('/podcast/:id', getOne);

// Admin
router.get('/admin/podcast', requireAuth, listAdmin);
router.get('/admin/podcast/:id', requireAuth, getOneAdmin);
router.post('/admin/podcast', requireAuth, createOne);
router.put('/admin/podcast/:id', requireAuth, updateOne);
router.delete('/admin/podcast/:id', requireAuth, deleteOne);

export default router;
