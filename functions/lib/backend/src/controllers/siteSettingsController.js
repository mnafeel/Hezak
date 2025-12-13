"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSiteSettingsHandler = exports.getSiteSettingsHandler = void 0;
const siteSettingsService_1 = require("../services/siteSettingsService");
const siteSettings_1 = require("../schemas/siteSettings");
const getSiteSettingsHandler = async (_req, res) => {
    try {
        const settings = await (0, siteSettingsService_1.getSiteSettings)();
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ error: 'Failed to fetch site settings' });
    }
};
exports.getSiteSettingsHandler = getSiteSettingsHandler;
const updateSiteSettingsHandler = async (req, res) => {
    try {
        const parsed = siteSettings_1.siteSettingsSchema.parse(req.body);
        const updated = await (0, siteSettingsService_1.updateSiteSettings)(parsed);
        res.json(updated);
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            res.status(400).json({ error: 'Invalid settings data', details: error });
            return;
        }
        console.error('Error updating site settings:', error);
        res.status(500).json({ error: 'Failed to update site settings' });
    }
};
exports.updateSiteSettingsHandler = updateSiteSettingsHandler;
//# sourceMappingURL=siteSettingsController.js.map