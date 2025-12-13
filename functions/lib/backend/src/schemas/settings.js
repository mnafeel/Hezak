"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featuredCountSchema = exports.adminPathSchema = void 0;
const zod_1 = require("zod");
exports.adminPathSchema = zod_1.z.object({
    adminPath: zod_1.z
        .string()
        .trim()
        .min(3, 'Admin path must be at least 3 characters')
        .max(30, 'Admin path must be at most 30 characters')
        .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed')
});
exports.featuredCountSchema = zod_1.z.object({
    featuredCount: zod_1.z.number().int().min(1).max(20)
});
//# sourceMappingURL=settings.js.map