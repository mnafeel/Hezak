"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthRouter = void 0;
const express_1 = require("express");
const userAuthController_1 = require("../controllers/userAuthController");
const userAuth_1 = require("../middleware/userAuth");
const router = (0, express_1.Router)();
router.post('/register', userAuthController_1.register);
router.post('/login', userAuthController_1.login);
router.post('/google', userAuthController_1.googleAuth);
router.put('/profile', userAuth_1.requireUserAuth, userAuthController_1.updateProfile);
exports.userAuthRouter = router;
//# sourceMappingURL=userAuthRoutes.js.map