import { z } from 'zod';

export const adminPathSchema = z.object({
  adminPath: z
    .string()
    .trim()
    .min(3, 'Admin path must be at least 3 characters')
    .max(30, 'Admin path must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed')
});

export const featuredCountSchema = z.object({
  featuredCount: z.number().int().min(1).max(20)
});

export type AdminPathInput = z.infer<typeof adminPathSchema>;
export type FeaturedCountInput = z.infer<typeof featuredCountSchema>;

