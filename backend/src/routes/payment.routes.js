import express from 'express';
import { initiatePayment, verifyPayment } from '../controllers/payment.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/initiate', protectRoute, initiatePayment);
router.post('/verify', protectRoute, verifyPayment);

export default router;
