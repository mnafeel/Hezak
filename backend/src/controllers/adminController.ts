import { Request, Response } from 'express';
import { z } from 'zod';
import { adminLoginSchema } from '../schemas/auth';
import { authenticateAdmin } from '../services/adminService';

export const adminLoginHandler = async (req: Request, res: Response) => {
  try {
    const credentials = adminLoginSchema.parse(req.body);
    const result = await authenticateAdmin(credentials);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid login payload', issues: error.issues });
    }

    res.status(401).json({ message: 'Invalid credentials' });
  }
};


