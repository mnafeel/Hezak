"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const userAuth_1 = require("../middleware/userAuth");
const router = (0, express_1.Router)();
router.post('/', userAuth_1.optionalUserAuth, orderController_1.createOrderHandler);
router.get('/me', userAuth_1.requireUserAuth, orderController_1.getMyOrdersHandler); // Get orders for authenticated user
router.get('/', auth_1.requireAdminAuth, orderController_1.getOrdersHandler);
router.put('/:id', auth_1.requireAdminAuth, orderController_1.updateOrderHandler);
router.get('/:id', auth_1.requireAdminAuth, orderController_1.getOrderHandler);
exports.orderRouter = router;
//# sourceMappingURL=orderRoutes.js.map