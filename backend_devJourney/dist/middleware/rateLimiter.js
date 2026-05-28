"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionRateLimiter = exports.submissionLimiter = exports.registerLimiter = exports.loginLimiter = exports.speedLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
/**
 * Ralentissement progressif des requêtes (Speed Limiting)
 */
exports.speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 10, // Commence à ralentir après 10 requêtes
    delayMs: (hits) => hits * 100, // Ajoute 100ms par requête supplémentaire
});
/**
 * Protection contre le Brute Force sur le Login
 */
const maxLoginAttempts = process.env.NODE_ENV === 'development' ? 100 : 5;
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: maxLoginAttempts,
    handler: (req, res, next, options) => {
        console.warn(`[SECURITY] Rate limit atteint pour l'IP: ${req.ip} sur ${req.originalUrl}`);
        res.status(options.statusCode).json(options.message);
    },
    message: {
        success: false,
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Protection contre le spam d'inscription
 */
exports.registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3,
    message: {
        success: false,
        message: 'Limite de création de compte atteinte. Veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Protection contre le spam de soumissions
 */
exports.submissionLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10,
    message: {
        success: false,
        message: 'Limite de soumissions atteinte. Veuillez réessayer dans une heure.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Compatibilité avec l'ancien nom de variable si nécessaire
exports.submissionRateLimiter = exports.submissionLimiter;
