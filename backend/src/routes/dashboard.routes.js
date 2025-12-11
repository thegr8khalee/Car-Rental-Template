import express from 'express';
import {
  getDashboardStats,
  getCarStats,
  getBlogStats,
  getUserStats,
  getContentModerationStats,
  getRevenueStats,
  getRecentActivity,
  getTopPerformers,
  getListings,
  getStaffs,
  getUsers,
  getCommentsStats,
  getComments,
  updateCommentStatus,
  getReviewsStats,
  getReviews,
  updateReviewStatus,
  getUserDetails,
} from '../controllers/dashboard.controller.js';
import { protectAdminRoute, requireRole } from '../middleware/protectAdminRoute.js';
import { getAllBlogs } from '../controllers/blog.controller.js';

const router = express.Router();

// Dashboard overview - all roles can access
router.get(
  '/stats',
  protectAdminRoute,
  requireRole(['super_admin', 'editor', 'moderator']),
  getDashboardStats
);

// Detailed stats endpoints - role-based access
router.get('/cars/stats', protectAdminRoute, requireRole(['super_admin', 'editor']), getCarStats);
router.get(
  '/blogs/stats',
  protectAdminRoute,
  requireRole(['super_admin', 'editor']),
  getBlogStats
);
router.get('/users/stats', protectAdminRoute, requireRole(['super_admin']), getUserStats);
router.get(
  '/moderation/stats',
  protectAdminRoute,
  requireRole(['super_admin', 'editor', 'moderator']),
  getContentModerationStats
);
router.get('/revenue/stats', protectAdminRoute, requireRole(['super_admin']), getRevenueStats);
router.get(
  '/activity/recent',
  protectAdminRoute,
  requireRole(['super_admin', 'editor', 'moderator']),
  getRecentActivity
);
router.get(
  '/performance/top',
  protectAdminRoute,
  requireRole(['super_admin', 'editor']),
  getTopPerformers
);
router.get(
  '/getListings',
  protectAdminRoute,
  requireRole(['super_admin', 'editor', 'moderator']),
  getListings
);
router.get('/getBlogs', protectAdminRoute, requireRole(['super_admin', 'editor']), getAllBlogs);
router.get(
  '/getListings',
  protectAdminRoute,
  requireRole(['super_admin', 'editor', 'moderator']),
  getListings
);
router.get('/getStaffs', protectAdminRoute, requireRole(['super_admin']), getStaffs);
router.get('/getUsers', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), getUsers);
router.get('/comments/stats', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), getCommentsStats);
router.get('/comments', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), getComments);
router.patch('/comments/:id/status', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), updateCommentStatus);
router.get('/reviews/stats', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), getReviewsStats);
router.get('/reviews', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), getReviews);
router.patch('/reviews/:id/status', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), updateReviewStatus);
router.get('/users/:id/details', protectAdminRoute, requireRole(['super_admin', 'editor', 'moderator']), getUserDetails);
export default router;
