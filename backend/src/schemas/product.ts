import { z } from 'zod';

export const productColorSchema = z.preprocess(
  (data: unknown) => {
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      let hex: string | undefined = undefined;
      if (obj.hex && typeof obj.hex === 'string' && obj.hex.trim().length > 0) {
        const trimmedHex = obj.hex.trim();
        // Only set hex if it's a valid hex code
        if (/^#(?:[0-9a-fA-F]{3}){1,2}$/i.test(trimmedHex)) {
          hex = trimmedHex;
        }
      }
      
      let imageUrl: string | undefined = undefined;
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
  },
  z.object({
    name: z.string().min(1),
    hex: z
      .union([
        z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/i, 'Color must be a valid hex code'),
        z.undefined()
      ])
      .optional(),
    imageUrl: z
      .union([
        z.string().refine(
          (val) => {
            if (!val || val === '') return false;
            if (val.startsWith('/uploads/')) {
              return true;
            }
            try {
              new URL(val);
              return true;
            } catch {
              return false;
            }
          },
          { message: 'Color image must be a valid URL or path' }
        ),
        z.undefined()
      ])
      .optional()
  })
);

export const productSizeSchema = z.object({
  name: z.string().min(1)
});

const baseProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.number().positive('Price must be a positive number'),
  imageUrl: z
    .string()
    .min(1, 'Primary image is required')
    .refine(
      (val) => {
        // Accept both absolute URLs and relative paths starting with /uploads/
        if (val.startsWith('/uploads/')) {
          return true;
        }
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Primary image must be a valid URL or path' }
    ),
  gallery: z
    .array(
      z
        .string()
        .refine(
          (val) => {
            if (val.startsWith('/uploads/')) {
              return true;
            }
            try {
              new URL(val);
              return true;
            } catch {
              return false;
            }
          },
          { message: 'Gallery images must be valid URLs or paths' }
        )
    )
    .optional()
    .default([]),
  colors: z.array(productColorSchema).optional().default([]),
  sizes: z.array(productSizeSchema).optional().default([]),
  itemType: z.string().min(1, 'Item type is required').max(100),
  inventory: z.number().int('Inventory must be an integer').nonnegative('Inventory cannot be negative').optional().default(0),
  inventoryVariants: z.array(
    z.object({
      colorName: z.string().min(1),
      sizeName: z.string().min(1),
      quantity: z.number().int().nonnegative()
    })
  ).optional().default([]),
  categoryIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  isFeatured: z.boolean().optional().default(false)
});

export const productSchema = z.preprocess(
  (data: unknown) => {
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      // Filter out empty strings from gallery array
      const gallery = Array.isArray(obj.gallery)
        ? obj.gallery.filter((url: unknown) => typeof url === 'string' && url.trim().length > 0)
        : [];
      return {
        ...obj,
        gallery
      };
    }
    return data;
  },
  baseProductSchema
);

export const updateProductSchema = baseProductSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

