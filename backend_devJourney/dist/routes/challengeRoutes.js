"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challengeController_1 = require("../controllers/challengeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', challengeController_1.getChallenges);
router.get('/:id', challengeController_1.getChallengeById);
// Teachers & Admins can create and update challenges
router.post('/', authMiddleware_1.protect, authMiddleware_1.teacherOrAdminOnly, challengeController_1.createChallenge);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.teacherOrAdminOnly, challengeController_1.updateChallenge);
// Only Admins can delete challenges (or optionally teachers too, based on standard logic we keep adminOnly or teacherOrAdminOnly)
// Let's say teachers can also delete them if they manage them
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.teacherOrAdminOnly, challengeController_1.deleteChallenge);
exports.default = router;
