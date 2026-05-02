import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Challenge from '../models/Challenge';
import User from '../models/User';
import { XP_REWARDS, Difficulty } from '../config/constants';
import { getCache, setCache, clearCache } from '../services/cacheService';

/**
 * Soumettre une solution à un challenge
 */
export const submitChallenge = async (req: any, res: Response): Promise<void> => {
  try {
    const { challengeId, githubRepoLink } = req.body;
    const userId = req.user._id;

    if (!challengeId || !githubRepoLink) {
      res.status(400).json({ message: 'Please provide challengeId and GitHub link' });
      return;
    }

    const challengeExists = await Challenge.findById(challengeId);
    if (!challengeExists) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    const existingSubmission = await Submission.findOne({ userId, challengeId });
    if (existingSubmission) {
      res.status(400).json({ message: 'You have already submitted a solution for this challenge' });
      return;
    }

    const submission = await Submission.create({ userId, challengeId, githubRepoLink });

    res.status(201).json({ message: 'Solution submitted successfully', submission });
  } catch (error: any) {
    console.error('submitChallenge error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Récupérer mes propres soumissions (Etudiant) 
 * OU les soumissions liées à mes challenges (Enseignant)
 */
export const getMySubmissions = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    let query: any = {};

    if (userRole === 'teacher') {
      // Un enseignant ne voit que les soumissions de SES challenges
      const myChallenges = await Challenge.find({ teacherId: userId }).select('_id');
      const challengeIds = myChallenges.map(c => c._id);
      query = { challengeId: { $in: challengeIds } };
    } else if (userRole === 'admin') {
      // L'admin voit tout
      query = {};
    } else {
      // L'étudiant ne voit que SES propres soumissions
      query = { userId };
    }

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .populate('userId', 'username email')
      .populate('challengeId', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: submissions,
    });
  } catch (error) {
    console.error('getMySubmissions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Récupérer les soumissions en attente (Filtré par enseignant)
 */
export const getPendingSubmissions = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query: any = { status: 'pending' };

    if (userRole === 'teacher') {
      const myChallenges = await Challenge.find({ teacherId: userId }).select('_id');
      const challengeIds = myChallenges.map(c => c._id);
      query.challengeId = { $in: challengeIds };
    }

    const submissions = await Submission.find(query)
      .populate('userId', 'username email')
      .populate('challengeId', 'title')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending submissions' });
  }
};

/**
 * Valider ou rejeter une soumission
 */
export const validateSubmission = async (req: any, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { status, feedback } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const submission = await Submission.findById(submissionId).populate('challengeId');
    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    // Vérifier que l'enseignant est bien le créateur du challenge (Sécurité)
    if (userRole === 'teacher') {
      const challenge = submission.challengeId as any;
      if (challenge.teacherId.toString() !== userId.toString()) {
        res.status(403).json({ message: 'Not authorized to review this submission' });
        return;
      }
    }

    if (status === 'approved' && submission.status !== 'approved') {
      const challenge = submission.challengeId as any;
      const xpAmount = XP_REWARDS[challenge?.difficulty as Difficulty] || XP_REWARDS.easy;
      await User.findByIdAndUpdate(submission.userId, { $inc: { completedChallenges: 1, xp: xpAmount } });
    }

    submission.status = status;
    if (feedback) submission.feedback = feedback;
    await submission.save();

    clearCache();
    res.status(200).json({ success: true, message: 'Submission reviewed successfully', submission });
  } catch (error) {
    console.error('validateSubmission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Récupérer toutes les soumissions (Filtré par enseignant)
 */
export const getAllSubmissions = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query: any = {};

    if (userRole === 'teacher') {
      const myChallenges = await Challenge.find({ teacherId: userId }).select('_id');
      const challengeIds = myChallenges.map(c => c._id);
      query = { challengeId: { $in: challengeIds } };
    }

    const submissions = await Submission.find(query)
      .populate('userId', 'username email')
      .populate('challengeId', 'title difficulty')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all submissions' });
  }
};

export const getUserSubmissionsByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const submissions = await Submission.find({ userId: user._id })
      .populate('challengeId', 'title difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user submissions' });
  }
};
