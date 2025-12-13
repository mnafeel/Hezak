"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyOrdersHandler = exports.updateOrderHandler = exports.getAdminReportHandler = exports.getOrderHandler = exports.getOrdersHandler = exports.createOrderHandler = void 0;
const zod_1 = require("zod");
const order_1 = require("../schemas/order");
const orderService_1 = require("../services/orderService");
const serializers_1 = require("../utils/serializers");
const orderIdParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive()
});
const createOrderHandler = async (req, res) => {
    try {
        const body = order_1.createOrderSchema.parse({
            ...req.body,
            userId: req.userId // Add logged-in user ID if available
        });
        const order = await (0, orderService_1.createOrder)(body);
        res.status(201).json((0, serializers_1.serializeOrder)(order));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
exports.createOrderHandler = createOrderHandler;
const getOrdersHandler = async (_req, res) => {
    try {
        const orders = await (0, orderService_1.listOrders)();
        res.json(orders.map(serializers_1.serializeOrder));
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};
exports.getOrdersHandler = getOrdersHandler;
const getOrderHandler = async (req, res) => {
    try {
        const { id } = orderIdParamSchema.parse(req.params);
        const order = await (0, orderService_1.getOrderById)(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json((0, serializers_1.serializeOrder)(order));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid order id' });
        }
        res.status(500).json({ message: 'Failed to fetch order' });
    }
};
exports.getOrderHandler = getOrderHandler;
const getAdminReportHandler = async (_req, res) => {
    try {
        const overview = await (0, orderService_1.getAdminOverview)();
        res.json({
            totalUsers: overview.totalUsers,
            totalOrders: overview.totalOrders,
            totalRevenue: (0, serializers_1.serializeMoney)(overview.totalRevenueCents)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to load admin report' });
    }
};
exports.getAdminReportHandler = getAdminReportHandler;
const updateOrderHandler = async (req, res) => {
    try {
        const { id } = orderIdParamSchema.parse(req.params);
        const body = order_1.updateOrderSchema.parse(req.body);
        const order = await (0, orderService_1.updateOrder)(id, body);
        res.json((0, serializers_1.serializeOrder)(order));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid order update payload', issues: error.issues });
        }
        if (error instanceof Error && error.message === 'Order not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to update order' });
    }
};
exports.updateOrderHandler = updateOrderHandler;
const getMyOrdersHandler = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const orders = await (0, orderService_1.getUserOrders)(req.userId);
        res.json(orders.map(serializers_1.serializeOrder));
    }
    catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Failed to fetch user orders' });
    }
};
exports.getMyOrdersHandler = getMyOrdersHandler;
//# sourceMappingURL=orderController.js.map