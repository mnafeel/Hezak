"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderBannersHandler = exports.deleteBannerHandler = exports.updateBannerHandler = exports.createBannerHandler = exports.getBannerByIdHandler = exports.getActiveBannersHandler = exports.getAllBannersHandler = void 0;
const zod_1 = require("zod");
const banner_1 = require("../schemas/banner");
const bannerService_1 = require("../services/bannerService");
const getAllBannersHandler = async (_req, res) => {
    try {
        const banners = await (0, bannerService_1.getAllBanners)();
        res.json(banners);
    }
    catch (error) {
        console.error('Error fetching banners:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        res.status(500).json({
            message: 'Failed to fetch banners',
            error: errorMessage
        });
    }
};
exports.getAllBannersHandler = getAllBannersHandler;
const getActiveBannersHandler = async (_req, res) => {
    try {
        const banners = await (0, bannerService_1.getActiveBanners)();
        res.json(banners);
    }
    catch (error) {
        console.error('Error fetching active banners:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        res.status(500).json({
            message: 'Failed to fetch active banners',
            error: errorMessage
        });
    }
};
exports.getActiveBannersHandler = getActiveBannersHandler;
const getBannerByIdHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid banner ID' });
        }
        const banner = await (0, bannerService_1.getBannerById)(id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.json(banner);
    }
    catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ message: 'Failed to fetch banner' });
    }
};
exports.getBannerByIdHandler = getBannerByIdHandler;
const createBannerHandler = async (req, res) => {
    try {
        console.log('Banner creation request body:', JSON.stringify(req.body, null, 2));
        const data = banner_1.bannerCreateSchema.parse(req.body);
        console.log('Parsed banner data:', JSON.stringify(data, null, 2));
        const banner = await (0, bannerService_1.createBanner)(data);
        res.status(201).json(banner);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('Validation error:', error.issues);
            return res.status(400).json({
                message: 'Invalid banner data',
                issues: error.issues
            });
        }
        console.error('Error creating banner:', error);
        res.status(500).json({
            message: 'Failed to create banner',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createBannerHandler = createBannerHandler;
const updateBannerHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid banner ID' });
        }
        const data = banner_1.bannerUpdateSchema.omit({ id: true }).parse(req.body);
        const banner = await (0, bannerService_1.updateBanner)(id, data);
        res.json(banner);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: 'Invalid banner data',
                issues: error.issues
            });
        }
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'Failed to update banner' });
    }
};
exports.updateBannerHandler = updateBannerHandler;
const deleteBannerHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid banner ID' });
        }
        await (0, bannerService_1.deleteBanner)(id);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Failed to delete banner' });
    }
};
exports.deleteBannerHandler = deleteBannerHandler;
const reorderBannersHandler = async (req, res) => {
    try {
        const { banners } = banner_1.bannerReorderSchema.parse(req.body);
        const updatedBanners = await (0, bannerService_1.reorderBanners)(banners);
        res.json(updatedBanners);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: 'Invalid reorder data',
                issues: error.issues
            });
        }
        console.error('Error reordering banners:', error);
        res.status(500).json({ message: 'Failed to reorder banners' });
    }
};
exports.reorderBannersHandler = reorderBannersHandler;
//# sourceMappingURL=bannerController.js.map