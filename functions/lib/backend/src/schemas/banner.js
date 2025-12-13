"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerReorderSchema = exports.bannerUpdateSchema = exports.bannerCreateSchema = void 0;
const zod_1 = require("zod");
const textElementSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.literal('text'),
    content: zod_1.z.string(),
    x: zod_1.z.number().min(0).max(100),
    y: zod_1.z.number().min(0).max(100),
    fontSize: zod_1.z.number().min(8).max(200),
    fontFamily: zod_1.z.string(),
    fontWeight: zod_1.z.enum(['normal', 'bold', '300', '400', '500', '600', '700', '800', '900']),
    color: zod_1.z.string(),
    textAlign: zod_1.z.enum(['left', 'center', 'right']),
    textShadow: zod_1.z.string().optional(),
    letterSpacing: zod_1.z.number().optional(),
    lineHeight: zod_1.z.number().optional(),
    animation: zod_1.z.enum(['fade', 'slide', 'zoom', 'bounce', 'pulse', 'none']).optional(),
    animationDelay: zod_1.z.number().min(0).max(10).optional(),
    animationDuration: zod_1.z.number().min(0.1).max(10).optional()
});
const imageElementSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.literal('image'),
    imageUrl: zod_1.z.string().min(1), // Accept any non-empty string (URL validation can be too strict for relative paths)
    productId: zod_1.z.preprocess((val) => {
        if (val === '' || val === undefined || val === null)
            return null;
        return typeof val === 'number' ? val : Number(val);
    }, zod_1.z.number().int().positive().nullable().optional()),
    productUrl: zod_1.z.preprocess((val) => {
        if (val === '' || val === undefined || val === null)
            return null;
        return val;
    }, zod_1.z.union([zod_1.z.string().min(1), zod_1.z.null()]).optional() // Accept any non-empty string, not just URLs
    ),
    x: zod_1.z.number().min(0).max(100),
    y: zod_1.z.number().min(0).max(100),
    width: zod_1.z.number().min(5).max(100),
    height: zod_1.z.preprocess((val) => {
        if (val === '' || val === undefined || val === null)
            return undefined;
        return typeof val === 'number' ? val : Number(val);
    }, zod_1.z.number().min(5).max(100).optional()),
    animation: zod_1.z.enum(['fade', 'slide', 'zoom', 'bounce', 'pulse', 'none']).optional(),
    animationDelay: zod_1.z.number().min(0).max(10).optional(),
    animationDuration: zod_1.z.number().min(0.1).max(10).optional()
});
const bannerElementSchema = zod_1.z.discriminatedUnion('type', [textElementSchema, imageElementSchema]);
exports.bannerCreateSchema = zod_1.z.object({
    title: zod_1.z.string().optional().nullable(),
    text: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.string().min(1, 'Image or Video URL is required'),
    videoUrl: zod_1.z.string().optional().nullable(),
    mediaType: zod_1.z.enum(['image', 'video']).default('image').optional(),
    linkUrl: zod_1.z.preprocess((val) => {
        // Transform empty string to null
        if (val === '' || val === undefined)
            return null;
        return val;
    }, zod_1.z.union([zod_1.z.string().url(), zod_1.z.null()]).optional().nullable()),
    order: zod_1.z.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
    textPosition: zod_1.z.enum(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right']).optional().nullable(),
    textAlign: zod_1.z.enum(['left', 'center', 'right']).optional().nullable(),
    animationStyle: zod_1.z.enum(['fade', 'slide', 'zoom', 'none']).optional().nullable(),
    overlayStyle: zod_1.z.enum(['gradient', 'solid', 'blur', 'none']).optional().nullable(),
    textElements: zod_1.z.array(bannerElementSchema).optional()
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
exports.bannerUpdateSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    title: zod_1.z.string().optional().nullable(),
    text: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.preprocess((val) => {
        if (val === '' || val === undefined || val === null)
            return null;
        return val;
    }, zod_1.z.union([zod_1.z.string().min(1), zod_1.z.null()]).optional().nullable()),
    videoUrl: zod_1.z.preprocess((val) => {
        if (val === '' || val === undefined || val === null)
            return null;
        return val;
    }, zod_1.z.union([zod_1.z.string().min(1), zod_1.z.null()]).optional().nullable()),
    mediaType: zod_1.z.enum(['image', 'video']).optional(),
    linkUrl: zod_1.z.preprocess((val) => {
        // Transform empty string to null
        if (val === '' || val === undefined)
            return null;
        return val;
    }, zod_1.z.union([zod_1.z.string().url(), zod_1.z.null()]).optional().nullable()),
    order: zod_1.z.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
    textPosition: zod_1.z.enum(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right']).optional().nullable(),
    textAlign: zod_1.z.enum(['left', 'center', 'right']).optional().nullable(),
    animationStyle: zod_1.z.enum(['fade', 'slide', 'zoom', 'none']).optional().nullable(),
    overlayStyle: zod_1.z.enum(['gradient', 'solid', 'blur', 'none']).optional().nullable(),
    textElements: zod_1.z.array(bannerElementSchema).optional()
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
exports.bannerReorderSchema = zod_1.z.object({
    banners: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.number().int().positive(),
        order: zod_1.z.number().int().min(0)
    }))
});
//# sourceMappingURL=banner.js.map