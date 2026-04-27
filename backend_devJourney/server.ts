import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import logger from './utils/logger';
import { ApiError } from './utils/ApiError';

dotenv.config();

const app = express();

// 1. Trust Proxy (MUST be set before rate limiters)
app.set('trust proxy', 1);

// 2. Security Headers (Helmet)
app.use(helmet());

// 3. Cookie Parsing (for HTTPOnly tokens)
app.use(cookieParser());

// 4. NoSQL Injection Protection
app.use(mongoSanitize());

// 5. Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

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
      console.log(`CORS blocked for origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

connectDB();

import authRoutes from './routes/authRoutes';
import challengeRoutes from './routes/challengeRoutes';
import submissionRoutes from './routes/submissionRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import userRoutes from './routes/userRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('DevJourney API is running');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof ApiError ? err.statusCode : (err.status || 500);
  const message = (process.env.NODE_ENV === 'production' && !(err instanceof ApiError))
    ? 'Something went wrong on our side. Internal Server Error.' 
    : err.message;

  logger.error(`${req.method} ${req.url} - Status: ${statusCode} - Error: ${err.message}`, {
    stack: err.stack,
    userId: (req as any).user?._id
  });

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});
