import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware de protection des routes (Authentification JWT)
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // Extraction du token (Header Bearer ou Cookie)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Non autorisé : Token manquant' });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

    const decoded: any = jwt.verify(token, jwtSecret);
    const currentUser = await User.findById(decoded.userId).select('-password');

    if (!currentUser) {
      res.status(401).json({ success: false, message: 'L\'utilisateur lié à ce token n\'existe plus' });
      return;
    }

    req.user = currentUser;
    next();
  } catch (error: any) {
    // Gestion propre des erreurs JWT
    let message = 'Session invalide ou expirée';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Votre session a expiré. Veuillez vous reconnecter.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token invalide ou corrompu.';
    }

    res.status(401).json({ success: false, message });
  }
};

/**
 * Middleware pour restreindre l'accès aux administrateurs
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Accès refusé : Droits administrateur requis' });
  }
};

/**
 * Middleware pour restreindre l'accès aux enseignants ou administrateurs
 */
export const teacherOrAdminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Accès refusé : Droits enseignant ou administrateur requis' });
  }
};
