"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderBanners = exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getBannerById = exports.getActiveBanners = exports.getAllBanners = void 0;
// @ts-nocheck
const prisma_1 = require("../utils/prisma");
const getAllBanners = async () => {
    try {
        // First, try to fix any corrupted textElements
        try {
            await prisma_1.prisma.$executeRaw `UPDATE Banner SET textElements = '[]' WHERE textElements IS NULL OR textElements = '' OR textElements = 'null'`;
        }
        catch (fixError) {
            console.warn('Could not fix corrupted textElements:', fixError);
        }
        const banners = await prisma_1.prisma.banner.findMany({
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });
        return banners;
    }
    catch (error) {
        console.error('Error in getAllBanners:', error);
        // If there's a data corruption error, try to fix it
        if (error instanceof Error && error.message.includes('Conversion failed')) {
            try {
                await prisma_1.prisma.$executeRaw `UPDATE Banner SET textElements = '[]' WHERE textElements IS NULL OR textElements = '' OR textElements = 'null'`;
                // Retry after fixing
                return await prisma_1.prisma.banner.findMany({
                    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
                });
            }
            catch (retryError) {
                console.error('Retry after fix failed:', retryError);
                // Return empty array as fallback
                return [];
            }
        }
        throw error;
    }
};
exports.getAllBanners = getAllBanners;
const getActiveBanners = async () => {
    try {
        // First, try to fix any corrupted textElements
        try {
            await prisma_1.prisma.$executeRaw `UPDATE Banner SET textElements = '[]' WHERE textElements IS NULL OR textElements = '' OR textElements = 'null'`;
        }
        catch (fixError) {
            console.warn('Could not fix corrupted textElements:', fixError);
        }
        const banners = await prisma_1.prisma.banner.findMany({
            where: { isActive: true },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });
        return banners;
    }
    catch (error) {
        console.error('Error in getActiveBanners:', error);
        // If there's a data corruption error, try to fix it
        if (error instanceof Error && error.message.includes('Conversion failed')) {
            try {
                await prisma_1.prisma.$executeRaw `UPDATE Banner SET textElements = '[]' WHERE textElements IS NULL OR textElements = '' OR textElements = 'null'`;
                // Retry after fixing
                return await prisma_1.prisma.banner.findMany({
                    where: { isActive: true },
                    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
                });
            }
            catch (retryError) {
                console.error('Retry after fix failed:', retryError);
                // Return empty array as fallback
                return [];
            }
        }
        throw error;
    }
};
exports.getActiveBanners = getActiveBanners;
const getBannerById = async (id) => {
    return prisma_1.prisma.banner.findUnique({
        where: { id }
    });
};
exports.getBannerById = getBannerById;
const createBanner = async (data) => {
    // Get the highest order value
    const maxOrder = await prisma_1.prisma.banner.aggregate({
        _max: { order: true }
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;
    // For create, imageUrl is required (non-nullable in Prisma)
    // Use videoUrl if mediaType is video and imageUrl is not provided
    const finalImageUrl = (data.imageUrl && data.imageUrl.trim().length > 0)
        ? data.imageUrl
        : ((data.mediaType === 'video' && data.videoUrl) ? '' : (data.imageUrl || ''));
    return prisma_1.prisma.banner.create({
        data: {
            ...data,
            order: data.order ?? nextOrder,
            title: data.title || null,
            text: data.text || null,
            imageUrl: finalImageUrl, // Required field, use empty string for video banners
            videoUrl: data.videoUrl || null,
            mediaType: data.mediaType || 'image',
            linkUrl: data.linkUrl || null,
            isActive: data.isActive ?? true,
            textPosition: data.textPosition || 'bottom-left',
            textAlign: data.textAlign || 'left',
            animationStyle: data.animationStyle || 'fade',
            overlayStyle: data.overlayStyle || 'gradient',
            textElements: data.textElements || []
        }
    });
};
exports.createBanner = createBanner;
const updateBanner = async (id, data) => {
    // Build update data, only including fields that are explicitly provided
    const updateData = {};
    if (data.title !== undefined)
        updateData.title = data.title || null;
    if (data.text !== undefined)
        updateData.text = data.text || null;
    if (data.videoUrl !== undefined)
        updateData.videoUrl = data.videoUrl || null;
    if (data.mediaType !== undefined)
        updateData.mediaType = data.mediaType;
    if (data.linkUrl !== undefined)
        updateData.linkUrl = data.linkUrl || null;
    if (data.order !== undefined)
        updateData.order = data.order;
    if (data.isActive !== undefined)
        updateData.isActive = data.isActive;
    if (data.textPosition !== undefined)
        updateData.textPosition = data.textPosition || null;
    if (data.textAlign !== undefined)
        updateData.textAlign = data.textAlign || null;
    if (data.animationStyle !== undefined)
        updateData.animationStyle = data.animationStyle || null;
    if (data.overlayStyle !== undefined)
        updateData.overlayStyle = data.overlayStyle || null;
    if (data.textElements !== undefined)
        updateData.textElements = data.textElements;
    // Only update imageUrl if explicitly provided (and convert null to empty string for Prisma)
    if (data.imageUrl !== undefined) {
        updateData.imageUrl = data.imageUrl || '';
    }
    return prisma_1.prisma.banner.update({
        where: { id },
        data: updateData
    });
};
exports.updateBanner = updateBanner;
const deleteBanner = async (id) => {
    return prisma_1.prisma.banner.delete({
        where: { id }
    });
};
exports.deleteBanner = deleteBanner;
const reorderBanners = async (bannerOrders) => {
    const updates = bannerOrders.map(({ id, order }) => prisma_1.prisma.banner.update({
        where: { id },
        data: { order }
    }));
    await Promise.all(updates);
    return (0, exports.getAllBanners)();
};
exports.reorderBanners = reorderBanners;
//# sourceMappingURL=bannerService.js.map