import { Router } from 'express';
import type { Response } from 'express';
import { adminLoginHandler } from '../controllers/adminController';
import { getAdminReportHandler } from '../controllers/orderController';
import { getAllUsers, getUser } from '../controllers/userController';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.post('/login', adminLoginHandler);
router.get('/reports/overview', requireAdminAuth, getAdminReportHandler);
router.get('/users', requireAdminAuth, getAllUsers);
router.get('/users/:id', requireAdminAuth, getUser);
router.get('/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ email: req.admin?.email });
});

export const adminRouter = router;

