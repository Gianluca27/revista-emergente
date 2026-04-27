import { Router } from 'express';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { submit, listAdmin, updateStatus } from '../controllers/contactController.js';

const router = Router();

// PUBLIC — rate-limited contact form submission
router.post('/contact', contactLimiter, submit);

// ADMIN — list contact requests (optional ?status= filter)
router.get('/admin/contact', requireAuth, listAdmin);

// ADMIN — update status of a single contact request
router.patch('/admin/contact/:id/status', requireAuth, updateStatus);

export default router;
