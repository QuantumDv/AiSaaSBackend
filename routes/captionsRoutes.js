import express from 'express';
import { deductCreditsAfterCaption } from '../controllers/captionsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/deduct-credits', authenticateToken, deductCreditsAfterCaption);

export default router; 