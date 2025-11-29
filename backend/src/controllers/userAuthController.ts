import { Request, Response } from 'express';
import { userRegisterSchema, userLoginSchema, updateUserProfileSchema, googleLoginSchema } from '../schemas/auth';
import { registerUser, loginUser, updateUserProfile, loginWithGoogle } from '../services/userAuthService';
import type { UserAuthenticatedRequest } from '../middleware/userAuth';

export const register = async (req: Request, res: Response) => {
  try {
    const validated = userRegisterSchema.parse(req.body);
    const result = await registerUser(validated);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validated = userLoginSchema.parse(req.body);
    const result = await loginUser(validated);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Login failed' });
    }
  }
};

export const updateProfile = async (req: UserAuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validated = updateUserProfileSchema.parse(req.body);
    const user = await updateUserProfile(req.userId, validated);
    res.json({ user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const validated = googleLoginSchema.parse(req.body);
    const result = await loginWithGoogle(validated.idToken);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Google authentication failed' });
    }
  }
};

