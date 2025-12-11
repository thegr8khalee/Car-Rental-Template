import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { commentBlog, getAllReviews, reviewCar, updateComment, updateReview, viewBlog } from '../controllers/interactions.controller.js';

const router = express.Router();

router.put('/viewBlog/:id', viewBlog);
router.put('/commentBlog/:id', protectRoute, commentBlog);
router.put('/updateComment/:id', protectRoute, updateComment);
router.put('/reviewCar/:id', protectRoute, reviewCar);
router.put('/updateReview/:id', protectRoute, updateReview);
router.get('/reviews/getAll', getAllReviews);

export default router;
