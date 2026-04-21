"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherOrAdminOnly = exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret)
            throw new Error('JWT_SECRET is not defined');
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const currentUser = await User_1.default.findById(decoded.userId).select('-password');
        if (!currentUser) {
            res.status(401).json({ message: 'User belonging to this token no longer exists' });
            return;
        }
        req.user = currentUser;
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Access denied, admin role required' });
    }
};
exports.adminOnly = adminOnly;
const teacherOrAdminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Access denied, teacher or admin role required' });
    }
};
exports.teacherOrAdminOnly = teacherOrAdminOnly;
