"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerRouter = void 0;
const express_1 = require("express");
const bannerController_1 = require("../controllers/bannerController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public route - get active banners for homepage
router.get('/active', bannerController_1.getActiveBannersHandler);
// Admin routes - require authentication
router.get('/', auth_1.requireAdminAuth, bannerController_1.getAllBannersHandler);
router.get('/:id', auth_1.requireAdminAuth, bannerController_1.getBannerByIdHandler);
router.post('/', auth_1.requireAdminAuth, bannerController_1.createBannerHandler);
router.put('/:id', auth_1.requireAdminAuth, bannerController_1.updateBannerHandler);
router.delete('/:id', auth_1.requireAdminAuth, bannerController_1.deleteBannerHandler);
router.post('/reorder', auth_1.requireAdminAuth, bannerController_1.reorderBannersHandler);
exports.bannerRouter = router;
//# sourceMappingURL=bannerRoutes.js.map