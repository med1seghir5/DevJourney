import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('La variable JWT_SECRET n\'est pas définie');
    }

    const decoded: any = jwt.verify(token, jwtSecret);
    const currentUser = await User.findById(decoded.userId).select('-password');

    if (!currentUser) {
      res.status(401).json({ message: 'L\'utilisateur rattaché à ce token n\'existe plus' });
      return;
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    res.status(401).json({ message: 'Non autorisé, token invalide' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, vous devez être administrateur' });
  }
};

export const teacherOrAdminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, droits de professeur requis' });
  }
};
