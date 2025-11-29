import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

export interface UserAuthenticatedRequest extends Request {
  userId?: number;
}

export const optionalUserAuth = (
  req: UserAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload & { userId: number };
    req.userId = payload.userId;
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }
  
  return next();
};

export const requireUserAuth = (
  req: UserAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload & { userId: number };
    
    // Verify that this is a user token (has userId), not an admin token
    if (!payload.userId) {
      return res.status(401).json({ message: 'Invalid token: user ID not found' });
    }
    
    req.userId = payload.userId;
    return next();
  } catch (error) {
    // Log the error for debugging
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

