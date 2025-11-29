import { Request, Response } from 'express';
import { z } from 'zod';
import {
  bannerCreateSchema,
  bannerUpdateSchema,
  bannerReorderSchema
} from '../schemas/banner';
import {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} from '../services/bannerService';

export const getAllBannersHandler = async (_req: Request, res: Response) => {
  try {
    const banners = await getAllBanners();
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    res.status(500).json({ 
      message: 'Failed to fetch banners',
      error: errorMessage
    });
  }
};

export const getActiveBannersHandler = async (_req: Request, res: Response) => {
  try {
    const banners = await getActiveBanners();
    res.json(banners);
  } catch (error) {
    console.error('Error fetching active banners:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    res.status(500).json({ 
      message: 'Failed to fetch active banners',
      error: errorMessage
    });
  }
};

export const getBannerByIdHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }
    
    const banner = await getBannerById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ message: 'Failed to fetch banner' });
  }
};

export const createBannerHandler = async (req: Request, res: Response) => {
  try {
    console.log('Banner creation request body:', JSON.stringify(req.body, null, 2));
    const data = bannerCreateSchema.parse(req.body);
    console.log('Parsed banner data:', JSON.stringify(data, null, 2));
    const banner = await createBanner(data);
    res.status(201).json(banner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return res.status(400).json({
        message: 'Invalid banner data',
        issues: error.issues
      });
    }
    
    console.error('Error creating banner:', error);
    res.status(500).json({ 
      message: 'Failed to create banner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateBannerHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }
    
    const data = bannerUpdateSchema.omit({ id: true }).parse(req.body);
    const banner = await updateBanner(id, data);
    res.json(banner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid banner data',
        issues: error.issues
      });
    }
    
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Failed to update banner' });
  }
};

export const deleteBannerHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }
    
    await deleteBanner(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Failed to delete banner' });
  }
};

export const reorderBannersHandler = async (req: Request, res: Response) => {
  try {
    const { banners } = bannerReorderSchema.parse(req.body);
    const updatedBanners = await reorderBanners(banners);
    res.json(updatedBanners);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid reorder data',
        issues: error.issues
      });
    }
    
    console.error('Error reordering banners:', error);
    res.status(500).json({ message: 'Failed to reorder banners' });
  }
};

