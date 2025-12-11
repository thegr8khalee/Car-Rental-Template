// routes/broadcast.routes.js (or wherever your router file is located)
import express from 'express';
// Assuming the necessary middleware is defined in this file
import { protectAdminRoute, requireRole } from '../middleware/protectAdminRoute.js';
import {
    createBroadcast,
    getBroadcasts,
    getBroadcastById,
    deleteBroadcast,
    getBroadcastStats
} from '../controllers/broadcast.controller.js';

const router = express.Router();

router.post(
    '/send',
    protectAdminRoute,
    requireRole(['super_admin', 'editor', 'moderator']),
    createBroadcast
);

router.get(
    '/stats',
    protectAdminRoute,
    requireRole(['super_admin', 'editor', 'moderator']),
    getBroadcastStats
);

router.get(
    '/',
    protectAdminRoute,
    requireRole(['super_admin', 'editor', 'moderator']),
    getBroadcasts
);

router.get(
    '/:id',
    protectAdminRoute,
    requireRole(['super_admin', 'editor', 'moderator']),
    getBroadcastById
);

router.delete(
    '/:id',
    protectAdminRoute,
    requireRole(['super_admin', 'editor']), // Suggesting restricted deletion rights
    deleteBroadcast
);


export default router;