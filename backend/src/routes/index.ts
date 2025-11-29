import { Router } from 'express';
import { productRouter } from './productRoutes';
import { categoryRouter } from './categoryRoutes';
import { orderRouter } from './orderRoutes';
import { adminRouter } from './adminRoutes';
import { settingsRouter } from './settingsRoutes';
import { uploadRouter } from './uploadRoutes';
import { userAuthRouter } from './userAuthRoutes';
import { bannerRouter } from './bannerRoutes';

const router = Router();

router.use('/products', productRouter);
router.use('/categories', categoryRouter);
router.use('/orders', orderRouter);
router.use('/admin', adminRouter);
router.use('/settings', settingsRouter);
router.use('/upload', uploadRouter);
router.use('/auth', userAuthRouter);
router.use('/banners', bannerRouter);

export { router };

