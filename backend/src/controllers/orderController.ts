import { Request, Response } from 'express';
import { z } from 'zod';
import { createOrderSchema, updateOrderSchema } from '../schemas/order';
import { createOrder, getAdminOverview, getOrderById, listOrders, updateOrder, getUserOrders } from '../services/orderService';
import { serializeMoney, serializeOrder } from '../utils/serializers';
import type { UserAuthenticatedRequest } from '../middleware/userAuth';

const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const createOrderHandler = async (req: UserAuthenticatedRequest, res: Response) => {
  try {
    const body = createOrderSchema.parse({
      ...req.body,
      userId: req.userId // Add logged-in user ID if available
    });
    const order = await createOrder(body);
    res.status(201).json(serializeOrder(order));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      return res.status(400).json({ 
        message: 'Invalid order payload', 
        errors: errorMessages,
        issues: error.issues 
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    console.error('Order creation error:', error);
    res.status(400).json({
      message: errorMessage
    });
  }
};

export const getOrdersHandler = async (_req: Request, res: Response) => {
  try {
    const orders = await listOrders();
    res.json(orders.map(serializeOrder));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const getOrderHandler = async (req: Request, res: Response) => {
  try {
    const { id } = orderIdParamSchema.parse(req.params);
    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(serializeOrder(order));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

export const getAdminReportHandler = async (_req: Request, res: Response) => {
  try {
    const overview = await getAdminOverview();
    res.json({
      totalUsers: overview.totalUsers,
      totalOrders: overview.totalOrders,
      totalRevenue: serializeMoney(overview.totalRevenueCents)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load admin report' });
  }
};

export const updateOrderHandler = async (req: Request, res: Response) => {
  try {
    const { id } = orderIdParamSchema.parse(req.params);
    const body = updateOrderSchema.parse(req.body);
    const order = await updateOrder(id, body);
    res.json(serializeOrder(order));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid order update payload', issues: error.issues });
    }
    if (error instanceof Error && error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update order' });
  }
};

export const getMyOrdersHandler = async (req: UserAuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const orders = await getUserOrders(req.userId);
    res.json(orders.map(serializeOrder));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
};

