import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export const submissionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each user to 5 requests per windowMs
  message: {
    message: 'Too many submissions, please try again after a minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID if authenticated, otherwise fall back to IP
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    if (user && user._id) {
      return `user:${user._id}`;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: (req: Request) => {
    // Don't rate limit if we can't identify the user
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress;
    return !user && !ip;
  },
});
