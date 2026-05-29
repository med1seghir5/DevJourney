import { Request, Response } from 'express';
import User from '../models/User';
import { getCache, setCache } from '../services/cacheService';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const cacheKey = `leaderboard_p${page}_l${limit}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }

    const teacherFilter = { role: { $ne: 'teacher' } };

    const total = await User.countDocuments(teacherFilter);
    const users = await User.find(teacherFilter)
      .select('username xp completedChallenges role profileImage')
      .sort({ xp: -1 })
      .skip(skip)
      .limit(limit);

    const responseData = {
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    };

    setCache(cacheKey, responseData, 120); // 2 minutes cache for the leaderboard
    res.status(200).json(responseData);
  } catch (error: any) {
    console.error('getLeaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
