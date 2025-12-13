import { Router } from 'express';
import {
  getAdminPathHandler,
  updateAdminPathHandler,
  getFeaturedCountHandler,
  updateFeaturedCountHandler
} from '../controllers/settingsController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

router.get('/admin-path', getAdminPathHandler);
router.put('/admin-path', requireAdminAuth, updateAdminPathHandler);
router.get('/featured-count', getFeaturedCountHandler);
router.put('/featured-count', requireAdminAuth, updateFeaturedCountHandler);

export const settingsRouter = router;

