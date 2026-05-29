"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const User_1 = __importDefault(require("../models/User"));
const cacheService_1 = require("../services/cacheService");
const getLeaderboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const cacheKey = `leaderboard_p${page}_l${limit}`;
        const cachedData = (0, cacheService_1.getCache)(cacheKey);
        if (cachedData) {
            res.status(200).json(cachedData);
            return;
        }
        const teacherFilter = { role: { $ne: 'teacher' } };
        const total = await User_1.default.countDocuments(teacherFilter);
        const users = await User_1.default.find(teacherFilter)
            .select('username xp completedChallenges role profileImage')
            .sort({ xp: -1 })
            .skip(skip)
            .limit(limit);
        const responseData = {
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: users,
        };
        (0, cacheService_1.setCache)(cacheKey, responseData, 120); // 2 minutes cache for the leaderboard
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error('getLeaderboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getLeaderboard = getLeaderboard;
