import { Router } from 'express';
import { submitChallenge, validateSubmission, getMySubmissions, getPendingSubmissions, getAllSubmissions } from '../controllers/submissionController';
import { protect, teacherOrAdminOnly } from '../middleware/authMiddleware';
import { submissionLimiter, speedLimiter } from '../middleware/rateLimiter';
import { verifyRecaptcha } from '../middleware/captchaMiddleware';
import { validate, submissionSchema } from '../middleware/validationMiddleware';

const router = Router();

// Appliquer le ralentissement progressif
router.use(speedLimiter);

router.get('/', protect, getMySubmissions);
router.get('/all', protect, teacherOrAdminOnly, getAllSubmissions);
router.get('/pending', protect, teacherOrAdminOnly, getPendingSubmissions);

// Protection par rate limit ET reCAPTCHA pour les soumissions
router.post('/', 
  protect, 
  validate(submissionSchema), 
  submissionLimiter, 
  verifyRecaptcha, 
  submitChallenge
);

router.put('/:submissionId/validate', protect, teacherOrAdminOnly, validateSubmission);

export default router;
