import { Router } from 'express';
import { submitChallenge, validateSubmission, getMySubmissions, getPendingSubmissions } from '../controllers/submissionController';

import { protect, teacherOrAdminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getMySubmissions);
router.get('/pending', protect, teacherOrAdminOnly, getPendingSubmissions);
router.post('/', protect, submitChallenge);
router.put('/:submissionId/validate', protect, teacherOrAdminOnly, validateSubmission);

export default router;
