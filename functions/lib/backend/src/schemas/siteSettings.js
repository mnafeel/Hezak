"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteSettingsSchema = void 0;
const zod_1 = require("zod");
exports.siteSettingsSchema = zod_1.z.object({
    // Text Content
    siteName: zod_1.z.string().optional(),
    welcomeTitle: zod_1.z.string().optional(),
    welcomeSubtitle: zod_1.z.string().optional(),
    browseAllTitle: zod_1.z.string().optional(),
    browseAllDescription: zod_1.z.string().optional(),
    topPicksTitle: zod_1.z.string().optional(),
    topPicksDescription: zod_1.z.string().optional(),
    featuredTitle: zod_1.z.string().optional(),
    featuredDescription: zod_1.z.string().optional(),
    topSellingTitle: zod_1.z.string().optional(),
    topSellingDescription: zod_1.z.string().optional(),
    shopNowText: zod_1.z.string().optional(),
    viewAllText: zod_1.z.string().optional(),
    discoverText: zod_1.z.string().optional(),
    startShoppingText: zod_1.z.string().optional(),
    // Premium Style Options
    headingFontSize: zod_1.z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
    bodyFontSize: zod_1.z.enum(['small', 'medium', 'large']).optional(),
    cardSpacing: zod_1.z.enum(['compact', 'normal', 'spacious']).optional(),
    animationSpeed: zod_1.z.enum(['slow', 'normal', 'fast']).optional(),
    shadowIntensity: zod_1.z.enum(['subtle', 'normal', 'dramatic']).optional(),
    borderRadius: zod_1.z.enum(['small', 'medium', 'large', 'xl']).optional(),
    hoverEffect: zod_1.z.enum(['none', 'subtle', 'moderate', 'strong']).optional(),
    gradientIntensity: zod_1.z.enum(['light', 'medium', 'strong']).optional(),
}).partial();
//# sourceMappingURL=siteSettings.js.map