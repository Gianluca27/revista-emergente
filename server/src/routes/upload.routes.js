import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

router.post('/admin/upload', requireAuth, uploadImage);

export default router;
