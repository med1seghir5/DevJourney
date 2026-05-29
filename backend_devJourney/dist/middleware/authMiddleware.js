"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherOrAdminOnly = exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
/**
 * Middleware de protection des routes (Authentification JWT)
 */
const protect = async (req, res, next) => {
    try {
        let token;
        // 1. Extraction du token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.auth_token) {
            token = req.cookies.auth_token;
        }
        // 2. Token presence verification
        if (!token || typeof token !== 'string' || token === 'undefined' || token === 'null') {
            res.status(401).json({ success: false, message: 'Unauthorized: Token missing or invalid' });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('[CRITICAL] JWT_SECRET is not defined in .env');
            res.status(500).json({ success: false, message: 'Internal configuration error' });
            return;
        }
        // 3. JWT verification
        // Wrapped specifically to catch format (malformed) errors
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        }
        catch (jwtErr) {
            const message = jwtErr.name === 'TokenExpiredError'
                ? 'Your session has expired.'
                : 'Invalid or corrupt token.';
            res.status(401).json({ success: false, message });
            return;
        }
        // 4. User verification
        if (!decoded || !decoded.userId) {
            res.status(401).json({ success: false, message: 'Invalid token payload' });
            return;
        }
        const currentUser = await User_1.default.findById(decoded.userId).select('-password');
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        // All good
        req.user = currentUser;
        next();
    }
    catch (error) {
        // Final catch to prevent Node.js thread crash
        console.error('[SECURITY] Unexpected error in authMiddleware:', error.message);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
};
exports.protect = protect;
/**
 * Middleware to restrict access to administrators
 */
const adminOnly = (req, res, next) => {
    try {
        if (req.user && req.user.role === 'admin') {
            next();
        }
        else {
            res.status(403).json({ success: false, message: 'Access denied: Administrator rights required' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying permissions' });
    }
};
exports.adminOnly = adminOnly;
/**
 * Middleware to restrict access to teachers or administrators
 */
const teacherOrAdminOnly = (req, res, next) => {
    try {
        if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
            next();
        }
        else {
            res.status(403).json({ success: false, message: 'Access denied: Rights required' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying permissions' });
    }
};
exports.teacherOrAdminOnly = teacherOrAdminOnly;
