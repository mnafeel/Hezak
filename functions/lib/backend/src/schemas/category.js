"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryProductsSchema = exports.updateCategorySchema = exports.categorySchema = void 0;
const zod_1 = require("zod");
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50),
    slug: zod_1.z
        .string()
        .min(2)
        .max(50)
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
    isTopSelling: zod_1.z.boolean().optional().default(false),
    isFeatured: zod_1.z.boolean().optional().default(false)
});
exports.updateCategorySchema = exports.categorySchema.partial();
exports.categoryProductsSchema = zod_1.z.object({
    productIds: zod_1.z.array(zod_1.z.coerce.number().int().positive()).default([]).optional()
});
//# sourceMappingURL=category.js.map