import { Request, Response } from 'express';
import Challenge from '../models/Challenge';
import { getCache, setCache } from '../services/cacheService';

export const createChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, difficulty } = req.body;

    if (!title || !description) {
      res.status(400).json({ message: 'Please provide a title and description' });
      return;
    }

    const challengeExists = await Challenge.findOne({ title });
    if (challengeExists) {
      res.status(400).json({ message: 'A challenge with this title already exists' });
      return;
    }

    const challenge = await Challenge.create({
      title,
      description,
      difficulty: difficulty || 'medium',
    });

    res.status(201).json({ message: 'Challenge created successfully', challenge });
  } catch (error: any) {
    console.error('createChallenge error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getChallenges = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const cacheKey = `challenges_p${page}_l${limit}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }

    const total = await Challenge.countDocuments({});
    const challenges = await Challenge.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const responseData = {
      success: true,
      count: challenges.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: challenges,
    };

    setCache(cacheKey, responseData, 300); // 5 minutes cache
    res.status(200).json(responseData);
  } catch (error) {
    console.error('getChallenges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getChallengeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }
    res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    res.status(200).json({ message: 'Challenge updated successfully', challenge });
  } catch (error: any) {
    console.error('updateChallenge error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    res.status(200).json({ message: 'Challenge deleted successfully' });
  } catch (error: any) {
    console.error('deleteChallenge error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
