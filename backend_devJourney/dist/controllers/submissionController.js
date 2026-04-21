"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSubmissionsByUsername = exports.getAllSubmissions = exports.validateSubmission = exports.getPendingSubmissions = exports.getMySubmissions = exports.submitChallenge = void 0;
const Submission_1 = __importDefault(require("../models/Submission"));
const Challenge_1 = __importDefault(require("../models/Challenge"));
const User_1 = __importDefault(require("../models/User"));
const constants_1 = require("../config/constants");
const cacheService_1 = require("../services/cacheService");
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
const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin';
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        let submissions;
        let total;
        if (isTeacher) {
            // Check cache for teacher view (all submissions)
            const cacheKey = `all_subs_p${page}_l${limit}`;
            const cachedData = (0, cacheService_1.getCache)(cacheKey);
            if (cachedData) {
                res.status(200).json(cachedData);
                return;
            }
            total = await Submission_1.default.countDocuments({});
            submissions = await Submission_1.default.find({})
                .populate('userId', 'username email')
                .populate('challengeId', 'title difficulty xpReward')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            const responseData = {
                success: true,
                count: submissions.length,
                total,
                page,
                pages: Math.ceil(total / limit),
                data: submissions,
            };
            (0, cacheService_1.setCache)(cacheKey, responseData, 60); // Cache for 1 minute
            res.status(200).json(responseData);
        }
        else {
            total = await Submission_1.default.countDocuments({ userId });
            submissions = await Submission_1.default.find({ userId })
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
    }
    catch (error) {
        console.error('getMySubmissions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMySubmissions = getMySubmissions;
const getPendingSubmissions = async (req, res) => {
    try {
        const submissions = await Submission_1.default.find({ status: 'pending' })
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
const validateSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status, feedback } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            res.status(400).json({ message: 'Invalid status (must be "approved" or "rejected")' });
            return;
        }
        const submission = await Submission_1.default.findById(submissionId).populate('challengeId');
        if (!submission) {
            res.status(404).json({ message: 'Submission not found' });
            return;
        }
        if (status === 'approved' && submission.status !== 'approved') {
            const challenge = submission.challengeId;
            const xpAmount = constants_1.XP_REWARDS[challenge?.difficulty] || constants_1.XP_REWARDS.easy;
            await User_1.default.findByIdAndUpdate(submission.userId, { $inc: { completedChallenges: 1, xp: xpAmount } });
        }
        else if (status === 'rejected' && submission.status === 'approved') {
            const challenge = submission.challengeId;
            const xpAmount = constants_1.XP_REWARDS[challenge?.difficulty] || constants_1.XP_REWARDS.easy;
            await User_1.default.findByIdAndUpdate(submission.userId, { $inc: { completedChallenges: -1, xp: -xpAmount } });
        }
        submission.status = status;
        if (feedback)
            submission.feedback = feedback;
        await submission.save();
        // Invalidate caches
        (0, cacheService_1.clearCache)();
        res.status(200).json({ success: true, message: 'Submission reviewed successfully', submission });
    }
    catch (error) {
        console.error('validateSubmission error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.validateSubmission = validateSubmission;
const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission_1.default.find({})
            .populate('userId', 'username email')
            .populate('challengeId', 'title difficulty')
            .sort({ createdAt: -1 });
        console.log(`[DEBUG] getAllSubmissions: Found ${submissions.length} total submissions in database.`);
        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions,
        });
    }
    catch (error) {
        console.error('getAllSubmissions error:', error);
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
        console.error('getUserSubmissionsByUsername error:', error);
        res.status(500).json({ message: 'Failed to fetch user submissions' });
    }
};
exports.getUserSubmissionsByUsername = getUserSubmissionsByUsername;
