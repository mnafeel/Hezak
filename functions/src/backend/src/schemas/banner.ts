import { z } from 'zod';

const textElementSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  content: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  fontSize: z.number().min(8).max(200),
  fontFamily: z.string(),
  fontWeight: z.enum(['normal', 'bold', '300', '400', '500', '600', '700', '800', '900']),
  color: z.string(),
  textAlign: z.enum(['left', 'center', 'right']),
  textShadow: z.string().optional(),
  letterSpacing: z.number().optional(),
  lineHeight: z.number().optional(),
  animation: z.enum(['fade', 'slide', 'zoom', 'bounce', 'pulse', 'none']).optional(),
  animationDelay: z.number().min(0).max(10).optional(),
  animationDuration: z.number().min(0.1).max(10).optional()
});

const imageElementSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  imageUrl: z.string().min(1), // Accept any non-empty string (URL validation can be too strict for relative paths)
  productId: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      return typeof val === 'number' ? val : Number(val);
    },
    z.number().int().positive().nullable().optional()
  ),
  productUrl: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      return val;
    },
    z.union([z.string().min(1), z.null()]).optional() // Accept any non-empty string, not just URLs
  ),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(5).max(100),
  height: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      return typeof val === 'number' ? val : Number(val);
    },
    z.number().min(5).max(100).optional()
  ),
  animation: z.enum(['fade', 'slide', 'zoom', 'bounce', 'pulse', 'none']).optional(),
  animationDelay: z.number().min(0).max(10).optional(),
  animationDuration: z.number().min(0.1).max(10).optional()
});

const bannerElementSchema = z.discriminatedUnion('type', [textElementSchema, imageElementSchema]);

export const bannerCreateSchema = z.object({
  title: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  imageUrl: z.string().min(1, 'Image or Video URL is required'),
  videoUrl: z.string().optional().nullable(),
  mediaType: z.enum(['image', 'video']).default('image').optional(),
  linkUrl: z.preprocess(
    (val) => {
      // Transform empty string to null
      if (val === '' || val === undefined) return null;
      return val;
    },
    z.union([z.string().url(), z.null()]).optional().nullable()
  ),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  textPosition: z.enum(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right']).optional().nullable(),
  textAlign: z.enum(['left', 'center', 'right']).optional().nullable(),
  animationStyle: z.enum(['fade', 'slide', 'zoom', 'none']).optional().nullable(),
  overlayStyle: z.enum(['gradient', 'solid', 'blur', 'none']).optional().nullable(),
  textElements: z.array(bannerElementSchema).optional()
}).refine((data) => {
  // Either imageUrl must be provided, or if mediaType is video, videoUrl must be provided
  if (data.mediaType === 'video') {
    return !!(data.videoUrl && data.videoUrl.trim().length > 0) || !!(data.imageUrl && data.imageUrl.trim().length > 0);
  }
  return !!(data.imageUrl && data.imageUrl.trim().length > 0);
}, {
  message: 'Either image or video URL is required',
  path: ['imageUrl']
});

export const bannerUpdateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  imageUrl: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      return val;
    },
    z.union([z.string().min(1), z.null()]).optional().nullable()
  ),
  videoUrl: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return null;
      return val;
    },
    z.union([z.string().min(1), z.null()]).optional().nullable()
  ),
  mediaType: z.enum(['image', 'video']).optional(),
  linkUrl: z.preprocess(
    (val) => {
      // Transform empty string to null
      if (val === '' || val === undefined) return null;
      return val;
    },
    z.union([z.string().url(), z.null()]).optional().nullable()
  ),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  textPosition: z.enum(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right']).optional().nullable(),
  textAlign: z.enum(['left', 'center', 'right']).optional().nullable(),
  animationStyle: z.enum(['fade', 'slide', 'zoom', 'none']).optional().nullable(),
  overlayStyle: z.enum(['gradient', 'solid', 'blur', 'none']).optional().nullable(),
  textElements: z.array(bannerElementSchema).optional()
}).refine((data) => {
  // If mediaType is video, videoUrl must be provided. Otherwise, imageUrl must be provided.
  // But if neither is provided and we're updating, that's okay (we might only be updating textElements)
  if (data.mediaType === 'video') {
    return !!(data.videoUrl && data.videoUrl.trim && data.videoUrl.trim().length > 0) || !data.videoUrl;
  }
  if (data.mediaType === 'image' || !data.mediaType) {
    return !!(data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) || !data.imageUrl;
  }
  return true; // If no mediaType specified, allow update (might be updating other fields)
}, {
  message: 'Either image URL or video URL is required based on media type',
  path: ['imageUrl']
});

export const bannerReorderSchema = z.object({
  banners: z.array(z.object({
    id: z.number().int().positive(),
    order: z.number().int().min(0)
  }))
});

