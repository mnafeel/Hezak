import { Request, Response } from 'express';
import { z } from 'zod';
import { adminPathSchema, featuredCountSchema, storeNameSchema } from '../schemas/settings';
import {
  getAdminPathSlug,
  updateAdminPathSlug,
  getFeaturedItemsCount,
  updateFeaturedItemsCount,
  getStoreName,
  updateStoreName
} from '../services/settingsService';

export const getAdminPathHandler = async (_req: Request, res: Response) => {
  const adminPath = await getAdminPathSlug();
  res.json({ adminPath });
};

export const updateAdminPathHandler = async (req: Request, res: Response) => {
  try {
    const { adminPath } = adminPathSchema.parse(req.body);
    const updated = await updateAdminPathSlug(adminPath);
    res.json({ adminPath: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid admin path',
        issues: error.issues
      });
    }

    return res.status(500).json({ message: 'Failed to update admin path' });
  }
};

export const getFeaturedCountHandler = async (_req: Request, res: Response) => {
  const count = await getFeaturedItemsCount();
  res.json({ featuredCount: count });
};

export const updateFeaturedCountHandler = async (req: Request, res: Response) => {
  try {
    const { featuredCount } = featuredCountSchema.parse(req.body);
    const updated = await updateFeaturedItemsCount(featuredCount);
    res.json({ featuredCount: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid featured count',
        issues: error.issues
      });
    }

    return res.status(500).json({ message: 'Failed to update featured count' });
  }
};

export const getStoreNameHandler = async (_req: Request, res: Response) => {
  const storeName = await getStoreName();
  res.json({ storeName });
};

export const updateStoreNameHandler = async (req: Request, res: Response) => {
  try {
    const { storeName } = storeNameSchema.parse(req.body);
    const updated = await updateStoreName(storeName);
    res.json({ storeName: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid store name',
        issues: error.issues
      });
    }

    return res.status(500).json({ message: 'Failed to update store name' });
  }
};

