import { Request, Response } from 'express';
import Challenge from '../models/Challenge';

export const createChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, difficulty } = req.body;
    
    if (!title || !description) {
      res.status(400).json({ message: 'Veuillez fournir un titre et une description' });
      return;
    }

    const challengeExists = await Challenge.findOne({ title });
    if (challengeExists) {
      res.status(400).json({ message: 'Un challenge avec ce titre existe déjà' });
      return;
    }

    const challenge = await Challenge.create({
      title,
      description,
      difficulty: difficulty || 'medium',
    });

    res.status(201).json({ message: 'Challenge créé avec succès', challenge });
  } catch (error: any) {
    console.error('Erreur createChallenge:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const getChallenges = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Challenge.countDocuments();
    const challenges = await Challenge.find().skip(startIndex).limit(limit).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: challenges,
    });
  } catch (error: any) {
    console.error('Erreur getChallenges:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const getChallengeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      res.status(404).json({ message: 'Challenge non trouvé' });
      return;
    }
    res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const updateChallenge = async (req: Request, res: Response): Promise<void> => {

  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!challenge) {
      res.status(404).json({ message: 'Challenge non trouvé' });
      return;
    }

    res.status(200).json({ message: 'Challenge mis à jour', challenge });
  } catch (error: any) {
    console.error('Erreur updateChallenge:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const deleteChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    
    if (!challenge) {
      res.status(404).json({ message: 'Challenge non trouvé' });
      return;
    }

    res.status(200).json({ message: 'Challenge supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur deleteChallenge:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};
