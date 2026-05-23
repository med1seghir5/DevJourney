"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeSubmission = exports.getUserSubmissionsByUsername = exports.getAllSubmissions = exports.validateSubmission = exports.getPendingSubmissions = exports.getMySubmissions = exports.submitChallenge = void 0;
const Submission_1 = __importDefault(require("../models/Submission"));
const Challenge_1 = __importDefault(require("../models/Challenge"));
const User_1 = __importDefault(require("../models/User"));
const constants_1 = require("../config/constants");
const cacheService_1 = require("../services/cacheService");
/**
 * Soumettre une solution à un challenge
 */
const submitChallenge = async (req, res) => {
    try {
        const { challengeId, githubRepoLink } = req.body;
        const userId = req.user._id;
        if (!challengeId || !githubRepoLink) {
            res.status(400).json({ message: 'Please provide challengeId and GitHub link' });
            return;
        }
        const challengeExists = await Challenge_1.default.findById(challengeId);
        if (!challengeExists) {
            res.status(404).json({ message: 'Challenge not found' });
            return;
        }
        const existingSubmission = await Submission_1.default.findOne({ userId, challengeId });
        if (existingSubmission) {
            res.status(400).json({ message: 'You have already submitted a solution for this challenge' });
            return;
        }
        const submission = await Submission_1.default.create({ userId, challengeId, githubRepoLink });
        res.status(201).json({ message: 'Solution submitted successfully', submission });
    }
    catch (error) {
        console.error('submitChallenge error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.submitChallenge = submitChallenge;
/**
 * Récupérer mes propres soumissions (Etudiant)
 * OU les soumissions liées à mes challenges (Enseignant)
 */
const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        let query = {};
        if (userRole === 'teacher') {
            // Un enseignant ne voit que les soumissions de SES challenges
            const myChallenges = await Challenge_1.default.find({ teacherId: userId }).select('_id');
            const challengeIds = myChallenges.map(c => c._id);
            query = { challengeId: { $in: challengeIds } };
        }
        else if (userRole === 'admin') {
            // L'admin voit tout
            query = {};
        }
        else {
            // L'étudiant ne voit que SES propres soumissions
            query = { userId };
        }
        const total = await Submission_1.default.countDocuments(query);
        const submissions = await Submission_1.default.find(query)
            .populate('userId', 'username email')
            .populate('challengeId', 'title difficulty')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            count: submissions.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: submissions,
        });
    }
    catch (error) {
        console.error('getMySubmissions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMySubmissions = getMySubmissions;
/**
 * Récupérer les soumissions en attente (Filtré par enseignant)
 */
const getPendingSubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        let query = { status: 'pending' };
        if (userRole === 'teacher') {
            const myChallenges = await Challenge_1.default.find({ teacherId: userId }).select('_id');
            const challengeIds = myChallenges.map(c => c._id);
            query.challengeId = { $in: challengeIds };
        }
        const submissions = await Submission_1.default.find(query)
            .populate('userId', 'username email')
            .populate('challengeId', 'title')
            .sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending submissions' });
    }
};
exports.getPendingSubmissions = getPendingSubmissions;
/**
 * Valider ou rejeter une soumission
 */
const validateSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status, feedback } = req.body;
        const userId = req.user._id;
        const userRole = req.user.role;
        if (!['approved', 'rejected'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }
        const submission = await Submission_1.default.findById(submissionId).populate('challengeId');
        if (!submission) {
            res.status(404).json({ message: 'Submission not found' });
            return;
        }
        // Vérifier que l'enseignant est bien le créateur du challenge (Sécurité)
        if (userRole === 'teacher') {
            const challenge = submission.challengeId;
            if (challenge.teacherId.toString() !== userId.toString()) {
                res.status(403).json({ message: 'Not authorized to review this submission' });
                return;
            }
        }
        if (status === 'approved' && submission.status !== 'approved') {
            const challenge = submission.challengeId;
            const xpAmount = constants_1.XP_REWARDS[challenge?.difficulty] || constants_1.XP_REWARDS.easy;
            await User_1.default.findByIdAndUpdate(submission.userId, { $inc: { completedChallenges: 1, xp: xpAmount } });
        }
        submission.status = status;
        if (feedback)
            submission.feedback = feedback;
        await submission.save();
        (0, cacheService_1.clearCache)();
        res.status(200).json({ success: true, message: 'Submission reviewed successfully', submission });
    }
    catch (error) {
        console.error('validateSubmission error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.validateSubmission = validateSubmission;
/**
 * Récupérer toutes les soumissions (Filtré par enseignant)
 */
const getAllSubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        let query = {};
        if (userRole === 'teacher') {
            const myChallenges = await Challenge_1.default.find({ teacherId: userId }).select('_id');
            const challengeIds = myChallenges.map(c => c._id);
            query = { challengeId: { $in: challengeIds } };
        }
        const submissions = await Submission_1.default.find(query)
            .populate('userId', 'username email')
            .populate('challengeId', 'title difficulty')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch all submissions' });
    }
};
exports.getAllSubmissions = getAllSubmissions;
const getUserSubmissionsByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User_1.default.findOne({ username });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const submissions = await Submission_1.default.find({ userId: user._id })
            .populate('challengeId', 'title difficulty')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch user submissions' });
    }
};
exports.getUserSubmissionsByUsername = getUserSubmissionsByUsername;
/**
 * Attribuer une note et un commentaire à une soumission (Teacher uniquement)
 * Gère les re-notations en calculant le delta XP (nouveau - ancien score)
 */
const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { score, comment } = req.body;
        const teacherId = req.user._id;
        const userRole = req.user.role;
        // Validation du score
        const parsedScore = parseInt(score, 10);
        if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 1000) {
            res.status(400).json({ message: 'Score invalide. Il doit être compris entre 0 et 1000.' });
            return;
        }
        const submission = await Submission_1.default.findById(submissionId).populate('challengeId');
        if (!submission) {
            res.status(404).json({ message: 'Soumission introuvable' });
            return;
        }
        // Vérifier que le teacher est le créateur du challenge
        if (userRole === 'teacher') {
            const challenge = submission.challengeId;
            if (!challenge || challenge.teacherId.toString() !== teacherId.toString()) {
                res.status(403).json({ message: 'Non autorisé : vous ne pouvez noter que les soumissions de vos propres challenges' });
                return;
            }
        }
        // Calculer le delta XP pour éviter l'inflation lors des re-notations
        const previousScore = submission.score || 0;
        const xpDelta = parsedScore - previousScore;
        // Mettre à jour la soumission
        submission.score = parsedScore;
        if (comment !== undefined && comment !== null) {
            submission.feedback = comment;
        }
        await submission.save();
        // Appliquer le delta XP sur le compte de l'utilisateur
        if (xpDelta !== 0) {
            await User_1.default.findByIdAndUpdate(submission.userId, { $inc: { xp: xpDelta } });
        }
        (0, cacheService_1.clearCache)();
        res.status(200).json({
            success: true,
            message: 'Note attribuée avec succès',
            submission,
            xpAwarded: parsedScore,
            xpDelta,
        });
    }
    catch (error) {
        console.error('gradeSubmission error:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.gradeSubmission = gradeSubmission;
