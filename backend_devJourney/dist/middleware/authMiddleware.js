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
        // 2. Vérification de la présence du token
        if (!token || typeof token !== 'string' || token === 'undefined' || token === 'null') {
            res.status(401).json({ success: false, message: 'Non autorisé : Token absent ou invalide' });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('[CRITICAL] JWT_SECRET is not defined in .env');
            res.status(500).json({ success: false, message: 'Erreur interne de configuration' });
            return;
        }
        // 3. Vérification du JWT
        // On entoure spécifiquement le verify pour attraper les erreurs de format (malformed)
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        }
        catch (jwtErr) {
            const message = jwtErr.name === 'TokenExpiredError'
                ? 'Votre session a expiré.'
                : 'Token invalide ou corrompu.';
            res.status(401).json({ success: false, message });
            return;
        }
        // 4. Vérification de l'utilisateur
        if (!decoded || !decoded.userId) {
            res.status(401).json({ success: false, message: 'Payload du token invalide' });
            return;
        }
        const currentUser = await User_1.default.findById(decoded.userId).select('-password');
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
            return;
        }
        // Tout est bon
        req.user = currentUser;
        next();
    }
    catch (error) {
        // Catch final pour éviter tout crash du thread Node.js
        console.error('[SECURITY] Erreur inattendue dans authMiddleware:', error.message);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'authentification' });
    }
};
exports.protect = protect;
/**
 * Middleware pour restreindre l'accès aux administrateurs
 */
const adminOnly = (req, res, next) => {
    try {
        if (req.user && req.user.role === 'admin') {
            next();
        }
        else {
            res.status(403).json({ success: false, message: 'Accès refusé : Droits administrateur requis' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la vérification des droits' });
    }
};
exports.adminOnly = adminOnly;
/**
 * Middleware pour restreindre l'accès aux enseignants ou administrateurs
 */
const teacherOrAdminOnly = (req, res, next) => {
    try {
        if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
            next();
        }
        else {
            res.status(403).json({ success: false, message: 'Accès refusé : Droits requis' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la vérification des droits' });
    }
};
exports.teacherOrAdminOnly = teacherOrAdminOnly;
