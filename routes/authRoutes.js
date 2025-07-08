import express from 'express';
import { login, register, authStatus, getCredits } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/status', authenticateToken, authStatus);
router.get('/user/credits', authenticateToken, getCredits);

export default router;
