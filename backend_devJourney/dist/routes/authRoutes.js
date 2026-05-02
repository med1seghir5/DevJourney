"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Appliquer le ralentissement progressif sur toutes les routes d'auth
router.use(rateLimiter_1.speedLimiter);
router.post('/register', rateLimiter_1.registerLimiter, (0, validationMiddleware_1.validate)(validationMiddleware_1.registerSchema), authController_1.register);
router.post('/verify-otp', authController_1.verifyOTP);
router.post('/login', rateLimiter_1.loginLimiter, (0, validationMiddleware_1.validate)(validationMiddleware_1.loginSchema), authController_1.login);
router.post('/refresh-token', authController_1.refreshUserToken);
router.post('/logout', authController_1.logout);
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
exports.default = router;
