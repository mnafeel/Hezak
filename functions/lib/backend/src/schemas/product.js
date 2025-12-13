"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.productSchema = exports.productSizeSchema = exports.productColorSchema = void 0;
const zod_1 = require("zod");
exports.productColorSchema = zod_1.z.preprocess((data) => {
    if (typeof data === 'object' && data !== null) {
        const obj = data;
        let hex = undefined;
        if (obj.hex && typeof obj.hex === 'string' && obj.hex.trim().length > 0) {
            const trimmedHex = obj.hex.trim();
            // Only set hex if it's a valid hex code
            if (/^#(?:[0-9a-fA-F]{3}){1,2}$/i.test(trimmedHex)) {
                hex = trimmedHex;
            }
        }
        let imageUrl = undefined;
        if (obj.imageUrl && typeof obj.imageUrl === 'string' && obj.imageUrl.trim().length > 0) {
            imageUrl = obj.imageUrl.trim();
        }
        return {
            ...obj,
            hex,
            imageUrl
        };
    }
    return data;
}, zod_1.z.object({
    name: zod_1.z.string().min(1),
    hex: zod_1.z
        .union([
        zod_1.z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/i, 'Color must be a valid hex code'),
        zod_1.z.undefined()
    ])
        .optional(),
    imageUrl: zod_1.z
        .union([
        zod_1.z.string().refine((val) => {
            if (!val || val === '')
                return false;
            if (val.startsWith('/uploads/')) {
                return true;
            }
            try {
                new URL(val);
                return true;
            }
            catch {
                return false;
            }
        }, { message: 'Color image must be a valid URL or path' }),
        zod_1.z.undefined()
    ])
        .optional()
}));
exports.productSizeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1)
});
const baseProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name must be at least 2 characters').max(100),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters').max(2000),
    price: zod_1.z.number().positive('Price must be a positive number'),
    imageUrl: zod_1.z
        .string()
        .min(1, 'Primary image is required')
        .refine((val) => {
        // Accept both absolute URLs and relative paths starting with /uploads/
        if (val.startsWith('/uploads/')) {
            return true;
        }
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, { message: 'Primary image must be a valid URL or path' }),
    gallery: zod_1.z
        .array(zod_1.z
        .string()
        .refine((val) => {
        if (val.startsWith('/uploads/')) {
            return true;
        }
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, { message: 'Gallery images must be valid URLs or paths' }))
        .optional()
        .default([]),
    colors: zod_1.z.array(exports.productColorSchema).optional().default([]),
    sizes: zod_1.z.array(exports.productSizeSchema).optional().default([]),
    itemType: zod_1.z.string().min(1, 'Item type is required').max(100),
    inventory: zod_1.z.number().int('Inventory must be an integer').nonnegative('Inventory cannot be negative').optional().default(0),
    inventoryVariants: zod_1.z.array(zod_1.z.object({
        colorName: zod_1.z.string().min(1),
        sizeName: zod_1.z.string().min(1),
        quantity: zod_1.z.number().int().nonnegative()
    })).optional().default([]),
    categoryIds: zod_1.z.array(zod_1.z.coerce.number().int().positive()).optional().default([]),
    isFeatured: zod_1.z.boolean().optional().default(false)
});
exports.productSchema = zod_1.z.preprocess((data) => {
    if (typeof data === 'object' && data !== null) {
        const obj = data;
        // Filter out empty strings from gallery array
        const gallery = Array.isArray(obj.gallery)
            ? obj.gallery.filter((url) => typeof url === 'string' && url.trim().length > 0)
            : [];
        // Convert categoryIds to numbers if they're strings (from Firestore)
        let categoryIds = obj.categoryIds;
        if (Array.isArray(categoryIds)) {
            categoryIds = categoryIds.map((id) => {
                if (typeof id === 'string') {
                    const num = Number(id);
                    return isNaN(num) ? id : num;
                }
                return id;
            });
        }
        return {
            ...obj,
            gallery,
            categoryIds
        };
    }
    return data;
}, baseProductSchema);
exports.updateProductSchema = baseProductSchema.partial();
//# sourceMappingURL=product.js.map