import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Challenge from '../models/Challenge';
import User from '../models/User';
import { XP_REWARDS, Difficulty } from '../config/constants';

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

export const getMySubmissions = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin';

    let submissions;
    if (isTeacher) {
      submissions = await Submission.find({})
        .populate('userId', 'username email')
        .populate('challengeId', 'title difficulty')
        .sort({ createdAt: -1 });
    } else {
      submissions = await Submission.find({ userId })
        .populate('challengeId', 'title difficulty')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error('getMySubmissions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPendingSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await Submission.find({ status: 'pending' })
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

export const validateSubmission = async (req: any, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status (must be "approved" or "rejected")' });
      return;
    }

    const submission = await Submission.findById(submissionId).populate('challengeId');
    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    if (status === 'approved' && submission.status !== 'approved') {
      const challenge = submission.challengeId as any;
      const xpAmount = XP_REWARDS[challenge?.difficulty as Difficulty] || XP_REWARDS.easy;

      await User.findByIdAndUpdate(submission.userId, { $inc: { completedChallenges: 1, xp: xpAmount } });
    } else if (status === 'rejected' && submission.status === 'approved') {
      const challenge = submission.challengeId as any;
      const xpAmount = XP_REWARDS[challenge?.difficulty as Difficulty] || XP_REWARDS.easy;

      await User.findByIdAndUpdate(submission.userId, { $inc: { completedChallenges: -1, xp: -xpAmount } });
    }

    submission.status = status;
    if (feedback) submission.feedback = feedback;
    await submission.save();

    res.status(200).json({ success: true, message: 'Submission reviewed successfully', submission });
  } catch (error) {
    console.error('validateSubmission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await Submission.find({})
      .populate('userId', 'username email')
      .populate('challengeId', 'title difficulty')
      .sort({ createdAt: -1 });

    console.log(`[DEBUG] getAllSubmissions: Found ${submissions.length} total submissions in database.`);
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error('getAllSubmissions error:', error);
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
    console.error('getUserSubmissionsByUsername error:', error);
    res.status(500).json({ message: 'Failed to fetch user submissions' });
  }
};
