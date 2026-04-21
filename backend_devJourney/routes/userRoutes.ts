import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/userController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, adminOnly, getUsers);
router.put('/role', protect, adminOnly, updateUserRole);

export default router;
