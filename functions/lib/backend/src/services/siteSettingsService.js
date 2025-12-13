"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSiteSettings = exports.getSiteSettings = void 0;
// @ts-nocheck
const prisma_1 = require("../utils/prisma");
const DEFAULT_SETTINGS = {
    siteName: 'Hezak Boutique',
    welcomeTitle: 'Welcome to Hezak Boutique',
    welcomeSubtitle: 'Your premium shopping destination. Start adding products to see them here.',
    browseAllTitle: 'Browse All Products',
    browseAllDescription: 'Explore our complete collection',
    topPicksTitle: 'Top Picks',
    topPicksDescription: "See what's trending",
    featuredTitle: 'Featured Collection',
    featuredDescription: 'Handpicked premium selections',
    topSellingTitle: '🔥 Top Selling',
    topSellingDescription: 'Our most popular items, loved by customers worldwide',
    shopNowText: 'Shop Now',
    viewAllText: 'View All',
    discoverText: 'Discover',
    startShoppingText: 'Start Shopping',
    headingFontSize: 'large',
    bodyFontSize: 'medium',
    cardSpacing: 'normal',
    animationSpeed: 'normal',
    shadowIntensity: 'normal',
    borderRadius: 'large',
    hoverEffect: 'moderate',
    gradientIntensity: 'medium',
};
const SETTINGS_KEY = 'siteSettings';
const getSiteSettings = async () => {
    const setting = await prisma_1.prisma.siteSettings.findUnique({
        where: { key: SETTINGS_KEY }
    });
    if (!setting) {
        // Initialize with defaults
        await prisma_1.prisma.siteSettings.create({
            data: {
                key: SETTINGS_KEY,
                value: JSON.stringify(DEFAULT_SETTINGS)
            }
        });
        return DEFAULT_SETTINGS;
    }
    try {
        const parsed = JSON.parse(setting.value);
        // Merge with defaults to ensure all fields exist
        return { ...DEFAULT_SETTINGS, ...parsed };
    }
    catch {
        return DEFAULT_SETTINGS;
    }
};
exports.getSiteSettings = getSiteSettings;
const updateSiteSettings = async (data) => {
    const current = await (0, exports.getSiteSettings)();
    const updated = { ...current, ...data };
    await prisma_1.prisma.siteSettings.upsert({
        where: { key: SETTINGS_KEY },
        create: {
            key: SETTINGS_KEY,
            value: JSON.stringify(updated)
        },
        update: {
            value: JSON.stringify(updated)
        }
    });
    return updated;
};
exports.updateSiteSettings = updateSiteSettings;
//# sourceMappingURL=siteSettingsService.js.map