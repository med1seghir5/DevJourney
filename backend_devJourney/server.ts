import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import logger from './utils/logger';
import { ApiError } from './utils/ApiError';

dotenv.config();

const app = express();

// 1. Sécurité des Headers (Helmet)
app.use(helmet());

// 2. Limite la taille du body pour prévenir les attaques DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. Protection contre les injections NoSQL
app.use(mongoSanitize());

// 4. Protection contre la pollution des paramètres HTTP (HPP)
app.use(hpp());

// 5. Cookie Parsing (pour les tokens HTTPOnly)
app.use(cookieParser());

// 6. Configuration du Proxy (Indispensable pour Render/Heroku pour le Rate Limiting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
} else {
  app.set('trust proxy', false);
}

// 7. Rate Limiting Global (Protection générale)
const globalLimiter = rateLimit({
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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué pour l'origine: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Connexion à la base de données
connectDB();

// Importation des routes
import authRoutes from './routes/authRoutes';
import challengeRoutes from './routes/challengeRoutes';
import submissionRoutes from './routes/submissionRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import userRoutes from './routes/userRoutes';

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('DevJourney API is secured and running');
});

// Gestion globale des erreurs
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof ApiError ? err.statusCode : (err.status || 500);
  
  const message = (process.env.NODE_ENV === 'production' && !(err instanceof ApiError))
    ? 'Une erreur interne est survenue.'
    : err.message;

  if (err.name !== 'TokenExpiredError' && err.name !== 'JsonWebTokenError') {
    logger.error(`${req.method} ${req.url} - Status: ${statusCode} - Error: ${err.message}`, {
      stack: err.stack,
      userId: (req as any).user?._id
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
  logger.info(`Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`);
});
