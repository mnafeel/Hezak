"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeaturedCountHandler = exports.getFeaturedCountHandler = exports.updateAdminPathHandler = exports.getAdminPathHandler = void 0;
const zod_1 = require("zod");
const settings_1 = require("../schemas/settings");
const settingsService_1 = require("../services/settingsService");
const getAdminPathHandler = async (_req, res) => {
    const adminPath = await (0, settingsService_1.getAdminPathSlug)();
    res.json({ adminPath });
};
exports.getAdminPathHandler = getAdminPathHandler;
const updateAdminPathHandler = async (req, res) => {
    try {
        const { adminPath } = settings_1.adminPathSchema.parse(req.body);
        const updated = await (0, settingsService_1.updateAdminPathSlug)(adminPath);
        res.json({ adminPath: updated });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: 'Invalid admin path',
                issues: error.issues
            });
        }
        return res.status(500).json({ message: 'Failed to update admin path' });
    }
};
exports.updateAdminPathHandler = updateAdminPathHandler;
const getFeaturedCountHandler = async (_req, res) => {
    const count = await (0, settingsService_1.getFeaturedItemsCount)();
    res.json({ featuredCount: count });
};
exports.getFeaturedCountHandler = getFeaturedCountHandler;
const updateFeaturedCountHandler = async (req, res) => {
    try {
        const { featuredCount } = settings_1.featuredCountSchema.parse(req.body);
        const updated = await (0, settingsService_1.updateFeaturedItemsCount)(featuredCount);
        res.json({ featuredCount: updated });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: 'Invalid featured count',
                issues: error.issues
            });
        }
        return res.status(500).json({ message: 'Failed to update featured count' });
    }
};
exports.updateFeaturedCountHandler = updateFeaturedCountHandler;
//# sourceMappingURL=settingsController.js.map