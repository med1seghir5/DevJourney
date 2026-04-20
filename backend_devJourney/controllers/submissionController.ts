import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Challenge from '../models/Challenge';
import User from '../models/User';

export const submitChallenge = async (req: any, res: Response): Promise<void> => {
  try {
    const { challengeId, githubRepoLink } = req.body;
    const userId = req.user._id;

    if (!challengeId || !githubRepoLink) {
      res.status(400).json({ message: 'Veuillez fournir le challengeId et le lien GitHub' });
      return;
    }

    const challengeExists = await Challenge.findById(challengeId);
    if (!challengeExists) {
      res.status(404).json({ message: 'Challenge non trouvé' });
      return;
    }

    // Check if the user already submitted this challenge
    const existingSubmission = await Submission.findOne({ userId, challengeId });
    if (existingSubmission) {
      res.status(400).json({ message: 'Vous avez déjà soumis une solution pour ce challenge' });
      return;
    }

    const submission = await Submission.create({
      userId,
      challengeId,
      githubRepoLink,
    });

    // Increment user completed challenges flag -> Moved to validateSubmission
    // await User.findByIdAndUpdate(userId, { $inc: { completedChallenges: 1 } });

    res.status(201).json({ message: 'Solution soumise avec succès', submission });
  } catch (error: any) {
    console.error('Erreur submitChallenge:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const getMySubmissions = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const submissions = await Submission.find({ userId }).sort({ submissionDate: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error('Erreur getMySubmissions:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const getPendingSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await Submission.find({ status: 'pending' })
      .populate('userId', 'username email')
      .populate('challengeId', 'title')
      .sort({ createdAt: 1 }); // Oldest first for review queue
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des soumissions en attente' });
  }
};

export const validateSubmission = async (req: any, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Statut invalide (doit être "approved" ou "rejected")' });
      return;
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      res.status(404).json({ message: 'Soumission non trouvée' });
      return;
    }

    // Gérer le leaderboard (completedChallenges & XP)
    if (status === 'approved' && submission.status !== 'approved') {
      await User.findByIdAndUpdate(submission.userId, { 
        $inc: { completedChallenges: 1, xp: 50 } 
      });
    } else if (status === 'rejected' && submission.status === 'approved') {
      await User.findByIdAndUpdate(submission.userId, { 
        $inc: { completedChallenges: -1, xp: -50 } 
      });
    }

    submission.status = status;
    if (feedback) submission.feedback = feedback;
    await submission.save();

    res.status(200).json({ success: true, message: 'Solution évaluée avec succès', submission });
  } catch (error) {
    console.error('Erreur validateSubmission:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

