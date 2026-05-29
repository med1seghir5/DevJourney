"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = __importDefault(require("./utils/logger"));
const ApiError_1 = require("./utils/ApiError");
dotenv_1.default.config();
const app = (0, express_1.default)();
// 1. Sécurité des Headers (Helmet)
app.use((0, helmet_1.default)());
// 2. Limite la taille du body pour prévenir les attaques DoS
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
// 3. Protection contre les injections NoSQL
app.use((0, express_mongo_sanitize_1.default)());
// 4. Protection contre la pollution des paramètres HTTP (HPP)
app.use((0, hpp_1.default)());
// 5. Cookie Parsing (pour les tokens HTTPOnly)
app.use((0, cookie_parser_1.default)());
// 6. Configuration du Proxy (Indispensable pour Render/Heroku pour le Rate Limiting)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}
else {
    app.set('trust proxy', false);
}
// 7. Rate Limiting Global (Protection générale)
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Trop de requêtes, veuillez réessayer plus tard.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);
// 8. Configuration CORS Strict
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://devjourney-gdg.vercel.app',
    'https://devjourney-gray.vercel.app',
    'https://devjourney.gdgbatna.com',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS bloqué pour l'origine: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Logging des requêtes en développement
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
        next();
    });
}
// Connexion à la base de données
(0, db_1.default)();
// Importation des routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const challengeRoutes_1 = __importDefault(require("./routes/challengeRoutes"));
const submissionRoutes_1 = __importDefault(require("./routes/submissionRoutes"));
const leaderboardRoutes_1 = __importDefault(require("./routes/leaderboardRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Routes API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/challenges', challengeRoutes_1.default);
app.use('/api/submissions', submissionRoutes_1.default);
app.use('/api/leaderboard', leaderboardRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.get('/', (req, res) => {
    res.send('DevJourney API is secured and running');
});
// Global error handling
app.use((err, req, res, next) => {
    const statusCode = err instanceof ApiError_1.ApiError ? err.statusCode : (err.status || 500);
    const message = (process.env.NODE_ENV === 'production' && !(err instanceof ApiError_1.ApiError))
        ? 'An internal server error occurred.'
        : err.message;
    if (err.name !== 'TokenExpiredError' && err.name !== 'JsonWebTokenError') {
        logger_1.default.error(`${req.method} ${req.url} - Status: ${statusCode} - Error: ${err.message}`, {
            stack: err.stack,
            userId: req.user?._id
        });
    }
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger_1.default.info(`Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`);
});
