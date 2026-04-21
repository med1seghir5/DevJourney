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
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = __importDefault(require("./utils/logger"));
const ApiError_1 = require("./utils/ApiError");
dotenv_1.default.config();
const app = (0, express_1.default)();
// 1. Security Headers (Helmet)
app.use((0, helmet_1.default)());
// 2. Cookie Parsing (for HTTPOnly tokens)
app.use((0, cookie_parser_1.default)());
// 3. NoSQL Injection Protection
app.use((0, express_mongo_sanitize_1.default)());
// 4. Global Rate Limiter
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);
app.set('trust proxy', 1);
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://devjourney-gdg.vercel.app',
    'https://devjourney-gray.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`CORS blocked for origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});
app.use(express_1.default.json());
(0, db_1.default)();
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
app.get('/', (req, res) => {
    res.send('DevJourney API is running');
});
// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err instanceof ApiError_1.ApiError ? err.statusCode : (err.status || 500);
    const message = (process.env.NODE_ENV === 'production' && !(err instanceof ApiError_1.ApiError))
        ? 'Something went wrong on our side. Internal Server Error.'
        : err.message;
    logger_1.default.error(`${req.method} ${req.url} - Status: ${statusCode} - Error: ${err.message}`, {
        stack: err.stack,
        userId: req.user?._id
    });
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger_1.default.info(`Server started on port ${PORT}`);
});
