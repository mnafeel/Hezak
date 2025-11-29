import { Router } from 'express';
import {
  createOrderHandler,
  getOrderHandler,
  getOrdersHandler,
  updateOrderHandler,
  getMyOrdersHandler
} from '../controllers/orderController';
import { requireAdminAuth } from '../middleware/auth';
import { optionalUserAuth, requireUserAuth } from '../middleware/userAuth';

const router = Router();

router.post('/', optionalUserAuth, createOrderHandler);
router.get('/me', requireUserAuth, getMyOrdersHandler); // Get orders for authenticated user
router.get('/', requireAdminAuth, getOrdersHandler);
router.put('/:id', requireAdminAuth, updateOrderHandler);
router.get('/:id', requireAdminAuth, getOrderHandler);

export const orderRouter = router;

