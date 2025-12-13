"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const express_1 = require("express");
const settingsController_1 = require("../controllers/settingsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/admin-path', settingsController_1.getAdminPathHandler);
router.put('/admin-path', auth_1.requireAdminAuth, settingsController_1.updateAdminPathHandler);
router.get('/featured-count', settingsController_1.getFeaturedCountHandler);
router.put('/featured-count', auth_1.requireAdminAuth, settingsController_1.updateFeaturedCountHandler);
exports.settingsRouter = router;
//# sourceMappingURL=settingsRoutes.js.map