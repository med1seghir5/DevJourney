import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';

// Configuration des variables d'environnement
dotenv.config();

// Initialisation de l'application
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Logger simple pour voir les requêtes entrantes
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cookieParser());

// Connexion à la base de données
connectDB();

// Routes
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

// Routes de test
app.get('/', (req: Request, res: Response) => {
  res.send('API DevJourney en ligne...');
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
