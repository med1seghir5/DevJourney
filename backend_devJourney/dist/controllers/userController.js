"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfileByUsername = exports.updateUserRole = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        if (!['user', 'teacher', 'admin'].includes(role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }
        const user = await User_1.default.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Role updated successfully', data: user });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update role' });
    }
};
exports.updateUserRole = updateUserRole;
const getUserProfileByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User_1.default.findOne({ username }).select('-password -email -otpCode -otpExpires');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error('getUserProfileByUsername error:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
};
exports.getUserProfileByUsername = getUserProfileByUsername;
