"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submissionController_1 = require("../controllers/submissionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const captchaMiddleware_1 = require("../middleware/captchaMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const router = (0, express_1.Router)();
// Appliquer le ralentissement progressif
router.use(rateLimiter_1.speedLimiter);
router.get('/', authMiddleware_1.protect, submissionController_1.getMySubmissions);
router.get('/all', authMiddleware_1.protect, authMiddleware_1.teacherOrAdminOnly, submissionController_1.getAllSubmissions);
router.get('/pending', authMiddleware_1.protect, authMiddleware_1.teacherOrAdminOnly, submissionController_1.getPendingSubmissions);
// Protection par rate limit ET reCAPTCHA pour les soumissions
router.post('/', authMiddleware_1.protect, (0, validationMiddleware_1.validate)(validationMiddleware_1.submissionSchema), rateLimiter_1.submissionLimiter, captchaMiddleware_1.verifyRecaptcha, submissionController_1.submitChallenge);
router.put('/:submissionId/validate', authMiddleware_1.protect, authMiddleware_1.teacherOrAdminOnly, submissionController_1.validateSubmission);
exports.default = router;
