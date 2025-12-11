import express from 'express';
import {
  adminLogin,
  adminLogout,
  adminSignup,
} from '../controllers/admin.controller.js';
import { checkAuth } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', adminSignup);
router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/check', checkAuth);

export default router;
