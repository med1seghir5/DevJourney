"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const User_1 = __importDefault(require("../models/User"));
const getLeaderboard = async (req, res) => {
    try {
        // Find users with verified emails, sort by completedChallenges desc, limit top 100
        const leaderboard = await User_1.default.find({ isVerified: true })
            .select('username name avatar completedChallenges')
            .sort({ completedChallenges: -1 })
            .limit(100);
        res.status(200).json({
            success: true,
            data: leaderboard,
        });
    }
    catch (error) {
        console.error('Erreur getLeaderboard:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.getLeaderboard = getLeaderboard;
