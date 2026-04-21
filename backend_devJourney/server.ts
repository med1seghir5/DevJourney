import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';

dotenv.config();

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. Cookie Parsing (for HTTPOnly tokens)
app.use(cookieParser());

// 3. NoSQL Injection Protection
app.use(mongoSanitize());

// 4. Global Rate Limiter: Max 100 requests per 15 mins
const globalLimiter = rateLimit({
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
app.use(cookieParser());

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
  console.error('[ERROR]', err.stack);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong on our side. Internal Server Error.'
    : err.message;

  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
