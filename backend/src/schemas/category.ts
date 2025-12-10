import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(200).optional().or(z.literal('')),
  isTopSelling: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false)
});

export const updateCategorySchema = categorySchema.partial();

export const categoryProductsSchema = z.object({
  productIds: z.array(z.coerce.number().int().positive()).default([])
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryProductsInput = z.infer<typeof categoryProductsSchema>;

