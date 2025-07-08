import express from 'express';
import { upload, uploadPaymentProof, getAllPayments, releaseCredits } from '../controllers/paymentsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', authenticateToken, upload.single('screenshot'), uploadPaymentProof);
router.get('/all', authenticateToken, getAllPayments);
router.post('/release/:id', authenticateToken, releaseCredits);

export default router; 