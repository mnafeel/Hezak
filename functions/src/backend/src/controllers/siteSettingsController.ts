import { Request, Response } from 'express';
import { getSiteSettings, updateSiteSettings } from '../services/siteSettingsService';
import { siteSettingsSchema } from '../schemas/siteSettings';

export const getSiteSettingsHandler = async (_req: Request, res: Response) => {
  try {
    const settings = await getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
};

export const updateSiteSettingsHandler = async (req: Request, res: Response) => {
  try {
    const parsed = siteSettingsSchema.parse(req.body);
    const updated = await updateSiteSettings(parsed);
    res.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid settings data', details: error });
      return;
    }
    console.error('Error updating site settings:', error);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
};

