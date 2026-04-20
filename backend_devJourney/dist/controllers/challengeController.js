"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChallenge = exports.updateChallenge = exports.getChallengeById = exports.getChallenges = exports.createChallenge = void 0;
const Challenge_1 = __importDefault(require("../models/Challenge"));
const createChallenge = async (req, res) => {
    try {
        const { title, description, difficulty } = req.body;
        if (!title || !description) {
            res.status(400).json({ message: 'Veuillez fournir un titre et une description' });
            return;
        }
        const challengeExists = await Challenge_1.default.findOne({ title });
        if (challengeExists) {
            res.status(400).json({ message: 'Un challenge avec ce titre existe déjà' });
            return;
        }
        const challenge = await Challenge_1.default.create({
            title,
            description,
            difficulty: difficulty || 'medium',
        });
        res.status(201).json({ message: 'Challenge créé avec succès', challenge });
    }
    catch (error) {
        console.error('Erreur createChallenge:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.createChallenge = createChallenge;
const getChallenges = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const total = await Challenge_1.default.countDocuments();
        const challenges = await Challenge_1.default.find().skip(startIndex).limit(limit).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: challenges.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: challenges,
        });
    }
    catch (error) {
        console.error('Erreur getChallenges:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.getChallenges = getChallenges;
const getChallengeById = async (req, res) => {
    try {
        const challenge = await Challenge_1.default.findById(req.params.id);
        if (!challenge) {
            res.status(404).json({ message: 'Challenge non trouvé' });
            return;
        }
        res.status(200).json({ success: true, data: challenge });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.getChallengeById = getChallengeById;
const updateChallenge = async (req, res) => {
    try {
        const challenge = await Challenge_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!challenge) {
            res.status(404).json({ message: 'Challenge non trouvé' });
            return;
        }
        res.status(200).json({ message: 'Challenge mis à jour', challenge });
    }
    catch (error) {
        console.error('Erreur updateChallenge:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.updateChallenge = updateChallenge;
const deleteChallenge = async (req, res) => {
    try {
        const challenge = await Challenge_1.default.findByIdAndDelete(req.params.id);
        if (!challenge) {
            res.status(404).json({ message: 'Challenge non trouvé' });
            return;
        }
        res.status(200).json({ message: 'Challenge supprimé avec succès' });
    }
    catch (error) {
        console.error('Erreur deleteChallenge:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};
exports.deleteChallenge = deleteChallenge;
