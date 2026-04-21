import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Challenge from '../models/Challenge';
import User from '../models/User';

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
    const submissions = await Submission.find({ userId })
      .populate('challengeId', 'title difficulty')
      .sort({ submissionDate: -1 });

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

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    if (status === 'approved' && submission.status !== 'approved') {
      await User.findByIdAndUpdate(submission.userId, { $inc: { completedChallenges: 1, xp: 50 } });
    } else if (status === 'rejected' && submission.status === 'approved') {
      await User.findByIdAndUpdate(submission.userId, { $inc: { completedChallenges: -1, xp: -50 } });
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
