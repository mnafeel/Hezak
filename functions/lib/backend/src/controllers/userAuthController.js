"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.updateProfile = exports.login = exports.register = void 0;
const auth_1 = require("../schemas/auth");
const userAuthService_1 = require("../services/userAuthService");
const register = async (req, res) => {
    try {
        const validated = auth_1.userRegisterSchema.parse(req.body);
        const result = await (0, userAuthService_1.registerUser)(validated);
        res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validated = auth_1.userLoginSchema.parse(req.body);
        const result = await (0, userAuthService_1.loginUser)(validated);
        res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Login failed' });
        }
    }
};
exports.login = login;
const updateProfile = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const validated = auth_1.updateUserProfileSchema.parse(req.body);
        const user = await (0, userAuthService_1.updateUserProfile)(req.userId, validated);
        res.json({ user });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
};
exports.updateProfile = updateProfile;
const googleAuth = async (req, res) => {
    try {
        const validated = auth_1.googleLoginSchema.parse(req.body);
        const result = await (0, userAuthService_1.loginWithGoogle)(validated.idToken);
        res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Google authentication failed' });
        }
    }
};
exports.googleAuth = googleAuth;
//# sourceMappingURL=userAuthController.js.map