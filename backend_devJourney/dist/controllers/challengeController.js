"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChallenge = exports.updateChallenge = exports.getChallengeById = exports.getChallenges = exports.createChallenge = void 0;
const Challenge_1 = __importDefault(require("../models/Challenge"));
const cacheService_1 = require("../services/cacheService");
const createChallenge = async (req, res) => {
    try {
        const { title, description, difficulty } = req.body;
        if (!title || !description) {
            res.status(400).json({ message: 'Please provide a title and description' });
            return;
        }
        const challengeExists = await Challenge_1.default.findOne({ title });
        if (challengeExists) {
            res.status(400).json({ message: 'A challenge with this title already exists' });
            return;
        }
        const challenge = await Challenge_1.default.create({
            title,
            description,
            difficulty: difficulty || 'medium',
        });
        res.status(201).json({ message: 'Challenge created successfully', challenge });
    }
    catch (error) {
        console.error('createChallenge error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createChallenge = createChallenge;
const getChallenges = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const cacheKey = `challenges_p${page}_l${limit}`;
        const cachedData = (0, cacheService_1.getCache)(cacheKey);
        if (cachedData) {
            res.status(200).json(cachedData);
            return;
        }
        const total = await Challenge_1.default.countDocuments({});
        const challenges = await Challenge_1.default.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const responseData = {
            success: true,
            count: challenges.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: challenges,
        };
        (0, cacheService_1.setCache)(cacheKey, responseData, 300); // 5 minutes cache
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error('getChallenges error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getChallenges = getChallenges;
const getChallengeById = async (req, res) => {
    try {
        const challenge = await Challenge_1.default.findById(req.params.id);
        if (!challenge) {
            res.status(404).json({ message: 'Challenge not found' });
            return;
        }
        res.status(200).json({ success: true, data: challenge });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getChallengeById = getChallengeById;
const updateChallenge = async (req, res) => {
    try {
        const challenge = await Challenge_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!challenge) {
            res.status(404).json({ message: 'Challenge not found' });
            return;
        }
        res.status(200).json({ message: 'Challenge updated successfully', challenge });
    }
    catch (error) {
        console.error('updateChallenge error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateChallenge = updateChallenge;
const deleteChallenge = async (req, res) => {
    try {
        const challenge = await Challenge_1.default.findByIdAndDelete(req.params.id);
        if (!challenge) {
            res.status(404).json({ message: 'Challenge not found' });
            return;
        }
        res.status(200).json({ message: 'Challenge deleted successfully' });
    }
    catch (error) {
        console.error('deleteChallenge error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteChallenge = deleteChallenge;
