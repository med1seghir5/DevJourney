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
  try {
    let token: string | undefined;

    // 1. Extraction du token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    // 2. Token presence verification
    if (!token || typeof token !== 'string' || token === 'undefined' || token === 'null') {
      res.status(401).json({ success: false, message: 'Unauthorized: Token missing or invalid' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[CRITICAL] JWT_SECRET is not defined in .env');
      res.status(500).json({ success: false, message: 'Internal configuration error' });
      return;
    }

    // 3. JWT verification
    // Wrapped specifically to catch format (malformed) errors
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtErr: any) {
      const message = jwtErr.name === 'TokenExpiredError' 
        ? 'Your session has expired.' 
        : 'Invalid or corrupt token.';
      res.status(401).json({ success: false, message });
      return;
    }

    // 4. User verification
    if (!decoded || !decoded.userId) {
      res.status(401).json({ success: false, message: 'Invalid token payload' });
      return;
    }

    const currentUser = await User.findById(decoded.userId).select('-password');
    if (!currentUser) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // All good
    req.user = currentUser;
    next();
  } catch (error: any) {
    // Final catch to prevent Node.js thread crash
    console.error('[SECURITY] Unexpected error in authMiddleware:', error.message);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * Middleware to restrict access to administrators
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Administrator rights required' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying permissions' });
  }
};

/**
 * Middleware to restrict access to teachers or administrators
 */
export const teacherOrAdminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Rights required' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying permissions' });
  }
};
