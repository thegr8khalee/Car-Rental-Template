import express from 'express';
import { checkAvailability, createRental, getUserRentals, getAllRentals } from '../controllers/rental.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { protectAdminRoute } from '../middleware/protectAdminRoute.js';

const router = express.Router();

router.post('/check-availability', checkAvailability);
router.post('/', protectRoute, createRental);
router.get('/my-rentals', protectRoute, getUserRentals);
router.get('/all', protectAdminRoute, getAllRentals);

export default router;
