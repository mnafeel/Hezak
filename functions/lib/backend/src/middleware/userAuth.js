"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUserAuth = exports.optionalUserAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const optionalUserAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.userId = payload.userId;
    }
    catch (error) {
        // Ignore invalid tokens for optional auth
    }
    return next();
};
exports.optionalUserAuth = optionalUserAuth;
const requireUserAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Verify that this is a user token (has userId), not an admin token
        if (!payload.userId) {
            return res.status(401).json({ message: 'Invalid token: user ID not found' });
        }
        req.userId = payload.userId;
        return next();
    }
    catch (error) {
        // Log the error for debugging
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.requireUserAuth = requireUserAuth;
//# sourceMappingURL=userAuth.js.map