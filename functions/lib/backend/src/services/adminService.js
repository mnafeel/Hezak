"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
// @ts-nocheck
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticateAdmin = async (input) => {
    if (input.email !== env_1.env.ADMIN_EMAIL) {
        throw new Error('Invalid credentials');
    }
    const passwordMatches = await bcrypt_1.default.compare(input.password, env_1.env.ADMIN_PASSWORD_HASH);
    if (!passwordMatches) {
        throw new Error('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({
        email: env_1.env.ADMIN_EMAIL
    }, env_1.env.JWT_SECRET, {
        expiresIn: '8h'
    });
    return {
        token
    };
};
exports.authenticateAdmin = authenticateAdmin;
//# sourceMappingURL=adminService.js.map