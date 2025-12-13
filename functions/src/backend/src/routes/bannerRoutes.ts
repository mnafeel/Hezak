import { Router } from 'express';
import {
  getAllBannersHandler,
  getActiveBannersHandler,
  getBannerByIdHandler,
  createBannerHandler,
  updateBannerHandler,
  deleteBannerHandler,
  reorderBannersHandler
} from '../controllers/bannerController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

// Public route - get active banners for homepage
router.get('/active', getActiveBannersHandler);

// Admin routes - require authentication
router.get('/', requireAdminAuth, getAllBannersHandler);
router.get('/:id', requireAdminAuth, getBannerByIdHandler);
router.post('/', requireAdminAuth, createBannerHandler);
router.put('/:id', requireAdminAuth, updateBannerHandler);
router.delete('/:id', requireAdminAuth, deleteBannerHandler);
router.post('/reorder', requireAdminAuth, reorderBannersHandler);

export const bannerRouter = router;

