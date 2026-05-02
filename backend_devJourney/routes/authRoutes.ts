import { Router } from 'express';
import { register, verifyOTP, login, refreshUserToken, logout, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validate, registerSchema, loginSchema } from '../middleware/validationMiddleware';
import { loginLimiter, registerLimiter, speedLimiter } from '../middleware/rateLimiter';

const router = Router();

// Appliquer le ralentissement progressif sur toutes les routes d'auth
router.use(speedLimiter);

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh-token', refreshUserToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
