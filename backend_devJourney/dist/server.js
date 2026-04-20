"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
// Configuration des variables d'environnement
dotenv_1.default.config();
// Initialisation de l'application
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
// Logger simple pour voir les requêtes entrantes
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Connexion à la base de données
(0, db_1.default)();
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const challengeRoutes_1 = __importDefault(require("./routes/challengeRoutes"));
const submissionRoutes_1 = __importDefault(require("./routes/submissionRoutes"));
const leaderboardRoutes_1 = __importDefault(require("./routes/leaderboardRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/challenges', challengeRoutes_1.default);
app.use('/api/submissions', submissionRoutes_1.default);
app.use('/api/leaderboard', leaderboardRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// Routes de test
app.get('/', (req, res) => {
    res.send('API DevJourney en ligne...');
});
// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
