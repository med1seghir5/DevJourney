import { Router } from 'express';
import { register, verifyOTP, login, refreshUserToken, logout, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

import { validate, registerSchema, loginSchema } from '../middleware/validationMiddleware';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', verifyOTP);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshUserToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
