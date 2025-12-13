"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', categoryController_1.getAllCategories);
router.post('/', auth_1.requireAdminAuth, categoryController_1.createCategoryHandler);
router.put('/:id', auth_1.requireAdminAuth, categoryController_1.updateCategoryHandler);
router.put('/:id/products', auth_1.requireAdminAuth, categoryController_1.updateCategoryProductsHandler);
router.delete('/:id', auth_1.requireAdminAuth, categoryController_1.deleteCategoryHandler);
exports.categoryRouter = router;
//# sourceMappingURL=categoryRoutes.js.map