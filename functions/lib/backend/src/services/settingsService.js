"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeaturedItemsCount = exports.getFeaturedItemsCount = exports.updateAdminPathSlug = exports.getAdminPathSlug = void 0;
// @ts-nocheck
const prisma_1 = require("../utils/prisma");
const ADMIN_PATH_KEY = 'adminPathSlug';
const DEFAULT_ADMIN_PATH = 'admin';
const normalizeSlug = (slug) => slug.trim().toLowerCase();
const ensureDefaultAdminPath = async () => {
    await prisma_1.prisma.appSetting.upsert({
        where: { key: ADMIN_PATH_KEY },
        create: {
            key: ADMIN_PATH_KEY,
            value: DEFAULT_ADMIN_PATH
        },
        update: {}
    });
};
const getAdminPathSlug = async () => {
    const setting = await prisma_1.prisma.appSetting.findUnique({
        where: { key: ADMIN_PATH_KEY }
    });
    if (!setting) {
        await ensureDefaultAdminPath();
        return DEFAULT_ADMIN_PATH;
    }
    return normalizeSlug(setting.value);
};
exports.getAdminPathSlug = getAdminPathSlug;
const updateAdminPathSlug = async (slug) => {
    const normalized = normalizeSlug(slug);
    const updated = await prisma_1.prisma.appSetting.upsert({
        where: { key: ADMIN_PATH_KEY },
        create: {
            key: ADMIN_PATH_KEY,
            value: normalized
        },
        update: {
            value: normalized
        }
    });
    return normalizeSlug(updated.value);
};
exports.updateAdminPathSlug = updateAdminPathSlug;
const FEATURED_COUNT_KEY = 'featuredItemsCount';
const DEFAULT_FEATURED_COUNT = 3;
const ensureDefaultFeaturedCount = async () => {
    await prisma_1.prisma.appSetting.upsert({
        where: { key: FEATURED_COUNT_KEY },
        create: {
            key: FEATURED_COUNT_KEY,
            value: String(DEFAULT_FEATURED_COUNT)
        },
        update: {}
    });
};
const getFeaturedItemsCount = async () => {
    const setting = await prisma_1.prisma.appSetting.findUnique({
        where: { key: FEATURED_COUNT_KEY }
    });
    if (!setting) {
        await ensureDefaultFeaturedCount();
        return DEFAULT_FEATURED_COUNT;
    }
    const count = parseInt(setting.value, 10);
    return isNaN(count) || count < 1 ? DEFAULT_FEATURED_COUNT : Math.min(count, 20);
};
exports.getFeaturedItemsCount = getFeaturedItemsCount;
const updateFeaturedItemsCount = async (count) => {
    const normalized = Math.max(1, Math.min(20, Math.round(count)));
    const updated = await prisma_1.prisma.appSetting.upsert({
        where: { key: FEATURED_COUNT_KEY },
        create: {
            key: FEATURED_COUNT_KEY,
            value: String(normalized)
        },
        update: {
            value: String(normalized)
        }
    });
    return parseInt(updated.value, 10);
};
exports.updateFeaturedItemsCount = updateFeaturedItemsCount;
//# sourceMappingURL=settingsService.js.map