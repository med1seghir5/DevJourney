import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.body;
    
    if (!['user', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({ message: 'Rôle invalide' });
      return;
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    res.status(200).json({ success: true, message: 'Rôle mis à jour avec succès', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
  }
};
