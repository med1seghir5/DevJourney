import { Router, Request, Response } from 'express';
import { register, verifyOTP, login, refreshUserToken, logout, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Routes principales d'authentification
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/refresh-token', refreshUserToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);



export default router;
