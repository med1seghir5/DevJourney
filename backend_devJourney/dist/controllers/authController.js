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
            res.status(400).json({ message: 'Veuillez remplir tous les champs' });
            return;
        }
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'Cet utilisateur existe déjà' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Compte directement vérifié — pas de vérification email
        const user = await User_1.default.create({
            username,
            email,
            password: hashedPassword,
            isVerified: true,
        });
        const jwtSecret = process.env.JWT_SECRET;
        const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'votre_refresh_secret';
        if (!jwtSecret)
            throw new Error('JWT_SECRET non défini');
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: 'Inscription réussie',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            accessToken: token,
            refreshToken,
        });
    }
    catch (error) {
        console.error('❌ ERREUR INSCRIPTION:', error);
        res.status(500).json({
            message: 'Erreur lors de l\'inscription',
            error: error.message
        });
    }
};
exports.register = register;
const verifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        if (!email || !otpCode) {
            res.status(400).json({ message: 'Veuillez fournir l\'email et le code OTP' });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ message: 'L\'utilisateur est déjà vérifié' });
            return;
        }
        if (user.otpCode !== otpCode) {
            res.status(400).json({ message: 'Code OTP invalide' });
            return;
        }
        if (user.otpExpires && user.otpExpires < new Date()) {
            res.status(400).json({ message: 'Le code OTP a expiré' });
            return;
        }
        // Code valide, on met à jour l'utilisateur
        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();
        // Générer les JWT
        const jwtSecret = process.env.JWT_SECRET;
        const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'votre_refresh_secret';
        if (!jwtSecret) {
            throw new Error('La variable JWT_SECRET n\'est pas définie');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        });
        res.status(200).json({
            message: 'Email vérifié avec succès',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            },
            accessToken: token,
            refreshToken,
        });
    }
    catch (error) {
        console.error('Erreur lors de la vérification OTP:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.verifyOTP = verifyOTP;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Veuillez fournir l\'email et le mot de passe' });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user || !user.password) {
            res.status(401).json({ message: 'Identifiants invalides' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Identifiants invalides' });
            return;
        }
        // Vérification email désactivée — tous les comptes sont directement accessibles
        const jwtSecret = process.env.JWT_SECRET;
        const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'votre_refresh_secret';
        if (!jwtSecret) {
            throw new Error('La variable JWT_SECRET n\'est pas définie');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: 'Connexion réussie',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            },
            token,
            refreshToken,
        });
    }
    catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.login = login;
const refreshUserToken = async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token manquant' });
        return;
    }
    try {
        const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'votre_refresh_secret';
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ message: 'Refresh token invalide' });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('La variable JWT_SECRET n\'est pas définie');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '15m' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000,
        });
        res.status(200).json({ token });
    }
    catch (error) {
        console.error('Erreur refresh token:', error);
        res.status(401).json({ message: 'Refresh token invalide ou expiré' });
    }
};
exports.refreshUserToken = refreshUserToken;
const logout = async (req, res) => {
    res.clearCookie('auth_token');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Déconnexion réussie' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.getMe = getMe;
