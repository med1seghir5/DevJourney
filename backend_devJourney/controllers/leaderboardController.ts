import { Request, Response } from 'express';
import User from '../models/User';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find users with verified emails, sort by completedChallenges desc, limit top 100
    const leaderboard = await User.find({ isVerified: true })
      .select('username name avatar completedChallenges')
      .sort({ completedChallenges: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    console.error('Erreur getLeaderboard:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};
