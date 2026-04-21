import { Router } from 'express';
import { createChallenge, getChallenges, updateChallenge, deleteChallenge, getChallengeById } from '../controllers/challengeController';
import { protect, teacherOrAdminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getChallenges);
router.get('/:id', getChallengeById);
router.post('/', protect, teacherOrAdminOnly, createChallenge);
router.put('/:id', protect, teacherOrAdminOnly, updateChallenge);
router.delete('/:id', protect, teacherOrAdminOnly, deleteChallenge);

export default router;
