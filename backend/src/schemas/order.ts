import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  selectedColor: z
    .object({
      name: z.string().min(1),
      hex: z
        .string()
        .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Color must be a valid hex code')
        .optional(),
      imageUrl: z.string().url().optional()
    })
    .optional()
    .nullable(),
  selectedSize: z
    .object({
      name: z.string().min(1)
    })
    .optional()
    .nullable()
});

export const orderCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(3),
  country: z.string().min(2)
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  customer: orderCustomerSchema,
  userId: z.number().int().positive().optional(),
  orderSource: z.enum(['WEBSITE', 'INSTAGRAM', 'PHONE', 'IN_PERSON', 'OTHER']).optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderStatusEnum = z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

export const updateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  trackingId: z.string().optional().nullable(),
  courierCompany: z.string().optional().nullable(),
  trackingLink: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url('Tracking link must be a valid URL').optional().nullable()
  )
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

