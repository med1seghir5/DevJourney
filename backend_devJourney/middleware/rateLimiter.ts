import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request } from 'express';

/**
 * Ralentissement progressif des requêtes (Speed Limiting)
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Commence à ralentir après 10 requêtes
  delayMs: (hits) => hits * 100, // Ajoute 100ms par requête supplémentaire
});

/**
 * Protection contre le Brute Force sur le Login
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
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
export const registerLimiter = rateLimit({
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
export const submissionLimiter = rateLimit({
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
export const submissionRateLimiter = submissionLimiter;
