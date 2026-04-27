import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listPublic,
  getFeatured,
  getOne,
  listCategories,
  listAdmin,
  getOneAdmin,
  createOne,
  updateOne,
  deleteOne,
  publishOne,
  unpublishOne,
} from '../controllers/publicationsController.js';

const router = Router();

// Público
router.get('/publications/featured', getFeatured);
router.get('/publications/:slug', getOne);
router.get('/publications', listPublic);
router.get('/categories', listCategories);

// Admin
router.get('/admin/publications', requireAuth, listAdmin);
router.get('/admin/publications/:id', requireAuth, getOneAdmin);
router.post('/admin/publications', requireAuth, createOne);
router.put('/admin/publications/:id', requireAuth, updateOne);
router.delete('/admin/publications/:id', requireAuth, deleteOne);
router.patch('/admin/publications/:id/publish', requireAuth, publishOne);
router.patch('/admin/publications/:id/unpublish', requireAuth, unpublishOne);

export default router;
