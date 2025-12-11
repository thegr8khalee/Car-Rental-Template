// routes/adminStaff.routes.js
import express from 'express';
import {
  addStaff,
  updateStaff,
  getStaffById,
  deleteStaff,
  getAllStaff,
} from '../controllers/adminStaff.controller.js';
import { protectAdminRoute, requireRole } from '../middleware/protectAdminRoute.js';

const router = express.Router();


// POST /api/admin/staff - Add new staff member
router.post('/', protectAdminRoute, requireRole(['super_admin']), addStaff);

// GET /api/admin/staff - Get all staff members
router.get('/', protectAdminRoute, requireRole(['super_admin']), getAllStaff);

// GET /api/admin/staff/:id - Get staff member by ID
router.get('/:id', protectAdminRoute, requireRole(['super_admin']), getStaffById);

// PUT /api/admin/staff/:id - Update staff member
router.put('/:id', protectAdminRoute, requireRole(['super_admin']), updateStaff);

// DELETE /api/admin/staff/:id - Delete staff member
router.delete('/:id', protectAdminRoute, requireRole(['super_admin']), deleteStaff);

export default router;