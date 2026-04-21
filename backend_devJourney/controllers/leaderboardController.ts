import { Request, Response } from 'express';
import User from '../models/User';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await User.find({ isVerified: true })
      .select('username name avatar completedChallenges xp')
      .sort({ xp: -1, completedChallenges: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: leaderboard });
  } catch (error: any) {
    console.error('getLeaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
