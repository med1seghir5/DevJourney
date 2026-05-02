"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Connexion à MongoDB avec gestion des erreurs de certificat
 */
const connectDB = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL is not defined in .env');
        }
        const options = {
            tls: true,
            tlsAllowInvalidCertificates: true, // Force la connexion malgré les erreurs de certificat système
            connectTimeoutMS: 10000,
        };
        const conn = await mongoose_1.default.connect(dbUrl, options);
        console.log(`✅ MongoDB Connecté : ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
        // Tentative de reconnexion automatique ou sortie propre
        console.log('Tentative de reconnexion dans 5 secondes...');
        setTimeout(connectDB, 5000);
    }
};
exports.default = connectDB;
