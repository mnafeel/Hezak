"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderSchema = exports.orderStatusEnum = exports.createOrderSchema = exports.orderCustomerSchema = exports.orderItemSchema = void 0;
const zod_1 = require("zod");
exports.orderItemSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    quantity: zod_1.z.number().int().positive(),
    selectedColor: zod_1.z
        .object({
        name: zod_1.z.string().min(1),
        hex: zod_1.z
            .string()
            .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Color must be a valid hex code')
            .optional(),
        imageUrl: zod_1.z.string().url().optional()
    })
        .optional()
        .nullable(),
    selectedSize: zod_1.z
        .object({
        name: zod_1.z.string().min(1)
    })
        .optional()
        .nullable()
});
exports.orderCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    addressLine1: zod_1.z.string().min(5),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2),
    state: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().min(3),
    country: zod_1.z.string().min(2)
});
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z.array(exports.orderItemSchema).min(1),
    customer: exports.orderCustomerSchema,
    userId: zod_1.z.number().int().positive().optional(),
    orderSource: zod_1.z.enum(['WEBSITE', 'INSTAGRAM', 'PHONE', 'IN_PERSON', 'OTHER']).optional()
});
exports.orderStatusEnum = zod_1.z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
exports.updateOrderSchema = zod_1.z.object({
    status: exports.orderStatusEnum.optional(),
    trackingId: zod_1.z.string().optional().nullable(),
    courierCompany: zod_1.z.string().optional().nullable(),
    trackingLink: zod_1.z.preprocess((val) => (val === '' ? null : val), zod_1.z.string().url('Tracking link must be a valid URL').optional().nullable())
});
//# sourceMappingURL=order.js.map