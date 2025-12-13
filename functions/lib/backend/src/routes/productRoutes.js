"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', productController_1.getAllProducts);
router.get('/:id', productController_1.getSingleProduct);
router.post('/', auth_1.requireAdminAuth, productController_1.createProductHandler);
router.put('/:id', auth_1.requireAdminAuth, productController_1.updateProductHandler);
router.delete('/:id', auth_1.requireAdminAuth, productController_1.deleteProductHandler);
exports.productRouter = router;
//# sourceMappingURL=productRoutes.js.map