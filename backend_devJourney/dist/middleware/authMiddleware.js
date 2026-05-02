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
    let token;
    // Extraction du token (Header Bearer ou Cookie)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }
    if (!token) {
        res.status(401).json({ success: false, message: 'Non autorisé : Token manquant' });
        return;
    }
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret)
            throw new Error('JWT_SECRET is not defined');
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const currentUser = await User_1.default.findById(decoded.userId).select('-password');
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'L\'utilisateur lié à ce token n\'existe plus' });
            return;
        }
        req.user = currentUser;
        next();
    }
    catch (error) {
        // Gestion propre des erreurs JWT
        let message = 'Session invalide ou expirée';
        if (error.name === 'TokenExpiredError') {
            message = 'Votre session a expiré. Veuillez vous reconnecter.';
        }
        else if (error.name === 'JsonWebTokenError') {
            message = 'Token invalide ou corrompu.';
        }
        res.status(401).json({ success: false, message });
    }
};
exports.protect = protect;
/**
 * Middleware pour restreindre l'accès aux administrateurs
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ success: false, message: 'Accès refusé : Droits administrateur requis' });
    }
};
exports.adminOnly = adminOnly;
/**
 * Middleware pour restreindre l'accès aux enseignants ou administrateurs
 */
const teacherOrAdminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
        next();
    }
    else {
        res.status(403).json({ success: false, message: 'Accès refusé : Droits enseignant ou administrateur requis' });
    }
};
exports.teacherOrAdminOnly = teacherOrAdminOnly;
