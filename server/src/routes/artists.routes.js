import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listPublic, getOne, getOneAdmin, createOne, updateOne, deleteOne } from '../controllers/artistsController.js';

const router = Router();

// Público
router.get('/artists', listPublic);
router.get('/artists/:slug', getOne);

// Admin
router.get('/admin/artists/:id', requireAuth, getOneAdmin);
router.post('/admin/artists', requireAuth, createOne);
router.put('/admin/artists/:id', requireAuth, updateOne);
router.delete('/admin/artists/:id', requireAuth, deleteOne);

export default router;
