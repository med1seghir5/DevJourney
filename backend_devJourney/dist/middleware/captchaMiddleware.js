"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRecaptcha = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Middleware pour valider le token Google reCAPTCHA v3
 * @param req
 * @param res
 * @param next
 */
const verifyRecaptcha = async (req, res, next) => {
    const token = req.body.captchaToken;
    // En mode développement, on peut sauter la vérification si nécessaire
    if (process.env.NODE_ENV === 'development' && !token) {
        return next();
    }
    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Vérification anti-bot manquante (Token reCAPTCHA requis).'
        });
    }
    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (!secretKey) {
            console.warn('RECAPTCHA_SECRET_KEY is not defined. Skipping validation.');
            return next();
        }
        const response = await axios_1.default.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`);
        const { success, score } = response.data;
        // Seuil de score reCAPTCHA v3 (0.0 = bot, 1.0 = humain)
        // 0.5 est un bon compromis pour commencer
        if (!success || score < 0.5) {
            return res.status(403).json({
                success: false,
                message: 'Activité suspecte détectée. Veuillez réessayer.'
            });
        }
        next();
    }
    catch (error) {
        console.error('Erreur lors de la validation reCAPTCHA:', error);
        // Fallback: Si l'API reCAPTCHA est injoignable, on laisse passer pour ne pas bloquer les utilisateurs légitimes
        next();
    }
};
exports.verifyRecaptcha = verifyRecaptcha;
