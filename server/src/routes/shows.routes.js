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
} from '../controllers/showsController.js';

const router = Router();

// Público
router.get('/shows', listPublic);
router.get('/shows/:slug', getOne);

// Admin
router.get('/admin/shows', requireAuth, listAdmin);
router.get('/admin/shows/:id', requireAuth, getOneAdmin);
router.post('/admin/shows', requireAuth, createOne);
router.put('/admin/shows/:id', requireAuth, updateOne);
router.delete('/admin/shows/:id', requireAuth, deleteOne);

export default router;
