"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSubmission = exports.getPendingSubmissions = exports.getMySubmissions = exports.submitChallenge = void 0;
const Submission_1 = __importDefault(require("../models/Submission"));
const Challenge_1 = __importDefault(require("../models/Challenge"));
const User_1 = __importDefault(require("../models/User"));
const submitChallenge = async (req, res) => {
    try {
        const { challengeId, githubRepoLink } = req.body;
        const userId = req.user._id;
        if (!challengeId || !githubRepoLink) {
            res.status(400).json({ message: 'Veuillez fournir le challengeId et le lien GitHub' });
            return;
        }
        const challengeExists = await Challenge_1.default.findById(challengeId);
        if (!challengeExists) {
            res.status(404).json({ message: 'Challenge non trouvé' });
            return;
        }
        // Check if the user already submitted this challenge
        const existingSubmission = await Submission_1.default.findOne({ userId, challengeId });
        if (existingSubmission) {
            res.status(400).json({ message: 'Vous avez déjà soumis une solution pour ce challenge' });
            return;
        }
        const submission = await Submission_1.default.create({
            userId,
            challengeId,
            githubRepoLink,
        });
        // Increment user completed challenges flag -> Moved to validateSubmission
        // await User.findByIdAndUpdate(userId, { $inc: { completedChallenges: 1 } });
        res.status(201).json({ message: 'Solution soumise avec succès', submission });
    }
    catch (error) {
        console.error('Erreur submitChallenge:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.submitChallenge = submitChallenge;
const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const submissions = await Submission_1.default.find({ userId }).sort({ submissionDate: -1 });
        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions,
        });
    }
    catch (error) {
        console.error('Erreur getMySubmissions:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.getMySubmissions = getMySubmissions;
const getPendingSubmissions = async (req, res) => {
    try {
        const submissions = await Submission_1.default.find({ status: 'pending' })
            .populate('userId', 'username email')
            .populate('challengeId', 'title')
            .sort({ createdAt: 1 }); // Oldest first for review queue
        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des soumissions en attente' });
    }
};
exports.getPendingSubmissions = getPendingSubmissions;
const validateSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status, feedback } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            res.status(400).json({ message: 'Statut invalide (doit être "approved" ou "rejected")' });
            return;
        }
        const submission = await Submission_1.default.findById(submissionId);
        if (!submission) {
            res.status(404).json({ message: 'Soumission non trouvée' });
            return;
        }
        // Gérer le leaderboard (completedChallenges & XP)
        if (status === 'approved' && submission.status !== 'approved') {
            await User_1.default.findByIdAndUpdate(submission.userId, {
                $inc: { completedChallenges: 1, xp: 50 }
            });
        }
        else if (status === 'rejected' && submission.status === 'approved') {
            await User_1.default.findByIdAndUpdate(submission.userId, {
                $inc: { completedChallenges: -1, xp: -50 }
            });
        }
        submission.status = status;
        if (feedback)
            submission.feedback = feedback;
        await submission.save();
        res.status(200).json({ success: true, message: 'Solution évaluée avec succès', submission });
    }
    catch (error) {
        console.error('Erreur validateSubmission:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.validateSubmission = validateSubmission;
