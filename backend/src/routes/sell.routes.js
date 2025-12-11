import express from 'express';
import { submitSellForm } from '../controllers/sell.controller.js';

const router = express.Router();

router.post('/submit', submitSellForm);

export default router;
