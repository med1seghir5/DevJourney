import { Router } from 'express';
import { createChallenge, getChallenges, updateChallenge, deleteChallenge, getChallengeById } from '../controllers/challengeController';
import { protect, teacherOrAdminOnly, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getChallenges); 
router.get('/:id', getChallengeById); 
// Teachers & Admins can create and update challenges
router.post('/', protect, teacherOrAdminOnly, createChallenge);
router.put('/:id', protect, teacherOrAdminOnly, updateChallenge);

// Only Admins can delete challenges (or optionally teachers too, based on standard logic we keep adminOnly or teacherOrAdminOnly)
// Let's say teachers can also delete them if they manage them
router.delete('/:id', protect, teacherOrAdminOnly, deleteChallenge);

export default router;
