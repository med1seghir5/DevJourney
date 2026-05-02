"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refreshUserToken = exports.login = exports.verifyOTP = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ message: 'Please fill in all fields' });
            return;
        }
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.default.create({
            username,
            email,
            password: hashedPassword,
            isVerified: true,
        });
        const jwtSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
        if (!jwtSecret)
            throw new Error('JWT_SECRET is not defined');
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, refreshSecret, { expiresIn: '7d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: 'Registration successful',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            accessToken: token,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.register = register;
const verifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        if (!email || !otpCode) {
            res.status(400).json({ message: 'Please provide email and OTP code' });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ message: 'User is already verified' });
            return;
        }
        if (user.otpCode !== otpCode) {
            res.status(400).json({ message: 'Invalid OTP code' });
            return;
        }
        if (user.otpExpires && user.otpExpires < new Date()) {
            res.status(400).json({ message: 'OTP code has expired' });
            return;
        }
        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();
        const jwtSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
        if (!jwtSecret)
            throw new Error('JWT_SECRET is not defined');
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, refreshSecret, { expiresIn: '7d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: 'Email verified successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            },
            accessToken: token,
        });
    }
    catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.verifyOTP = verifyOTP;
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        console.log(`Login attempt for identifier: ${identifier}`);
        if (!identifier || !password) {
            res.status(400).json({ message: 'Please provide email/username and password' });
            return;
        }
        const user = await User_1.default.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });
        console.log(`User found: ${!!user}`);
        if (!user || !user.password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        console.log(`Password match: ${isMatch}`);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
        console.log(`JWT_SECRET defined: ${!!jwtSecret}`);
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET is missing in environment variables");
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, refreshSecret, { expiresIn: '7d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        console.error('SERVER LOGIN ERROR:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.login = login;
const refreshUserToken = async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token missing' });
        return;
    }
    try {
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
        const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret)
            throw new Error('JWT_SECRET is not defined');
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '15m' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
        });
        res.status(200).json({ token });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};
exports.refreshUserToken = refreshUserToken;
const logout = async (req, res) => {
    res.clearCookie('auth_token');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMe = getMe;
