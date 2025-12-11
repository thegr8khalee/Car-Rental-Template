// routes/sellSubmission.routes.js
import express from 'express';
import { deleteSellSubmission, getSellSubmissions, getSellSubmissionsStats, sendOffer, updateSellSubmissionStatus } from '../controllers/sellSubmissions.controller.js';
import { protectAdminRoute, requireRole } from '../middleware/protectAdminRoute.js';

const router = express.Router();

// GET /api/admin/dashboard/sell-submissions/stats - Get statistics
router.get('/stats', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), getSellSubmissionsStats);

// GET /api/admin/dashboard/sell-submissions - Get paginated submissions
router.get('/', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), getSellSubmissions);

// PATCH /api/admin/dashboard/sell-submissions/:id/status - Update status
router.patch('/:id/status', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), updateSellSubmissionStatus);

// POST /api/admin/dashboard/sell-submissions/:id/offer - Send offer
router.post('/:id/offer', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), sendOffer);

// DELETE /api/admin/dashboard/sell-submissions/:id - Delete submission
router.delete('/:id', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), deleteSellSubmission);

export default router;