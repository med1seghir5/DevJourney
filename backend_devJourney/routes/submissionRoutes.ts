import { Router } from 'express';
import { submitChallenge, validateSubmission, getMySubmissions, getPendingSubmissions, getAllSubmissions } from '../controllers/submissionController';
import { protect, teacherOrAdminOnly } from '../middleware/authMiddleware';
import { submissionRateLimiter } from '../middleware/rateLimiter';

import { validate, submissionSchema } from '../middleware/validationMiddleware';

const router = Router();

router.get('/', protect, getMySubmissions);
router.get('/all', protect, teacherOrAdminOnly, getAllSubmissions);
router.get('/pending', protect, teacherOrAdminOnly, getPendingSubmissions);
router.post('/', protect, validate(submissionSchema), submissionRateLimiter, submitChallenge);
router.put('/:submissionId/validate', protect, teacherOrAdminOnly, validateSubmission);

export default router;
