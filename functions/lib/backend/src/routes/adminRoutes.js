"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const orderController_1 = require("../controllers/orderController");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', adminController_1.adminLoginHandler);
router.get('/reports/overview', auth_1.requireAdminAuth, orderController_1.getAdminReportHandler);
router.get('/users', auth_1.requireAdminAuth, userController_1.getAllUsers);
router.get('/users/:id', auth_1.requireAdminAuth, userController_1.getUser);
router.get('/me', auth_1.requireAdminAuth, (req, res) => {
    res.json({ email: req.admin?.email });
});
exports.adminRouter = router;
//# sourceMappingURL=adminRoutes.js.map