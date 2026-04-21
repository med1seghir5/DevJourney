import { Router } from 'express';
import { getUsers, updateUserRole, getUserProfileByUsername } from '../controllers/userController';
import { getUserSubmissionsByUsername } from '../controllers/submissionController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, adminOnly, getUsers);
router.put('/role', protect, adminOnly, updateUserRole);
router.get('/profile/:username', getUserProfileByUsername);
router.get('/profile/:username/submissions', getUserSubmissionsByUsername);

export default router;
