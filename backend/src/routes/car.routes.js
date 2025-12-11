import express from 'express';
import { getAllCars, getCarById, Search } from '../controllers/car.controller.js';

const router = express.Router();

router.get('/get-all', getAllCars);
router.get('/get/:id', getCarById);
router.get('/search', Search);

export default router;
