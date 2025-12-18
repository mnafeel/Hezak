import { Router } from 'express';
import {
  getAdminPathHandler,
  updateAdminPathHandler,
  getFeaturedCountHandler,
  updateFeaturedCountHandler,
  getStoreNameHandler,
  updateStoreNameHandler
} from '../controllers/settingsController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

router.get('/admin-path', getAdminPathHandler);
router.put('/admin-path', requireAdminAuth, updateAdminPathHandler);
router.get('/featured-count', getFeaturedCountHandler);
router.put('/featured-count', requireAdminAuth, updateFeaturedCountHandler);
router.get('/store-name', getStoreNameHandler);
router.put('/store-name', requireAdminAuth, updateStoreNameHandler);

export const settingsRouter = router;

