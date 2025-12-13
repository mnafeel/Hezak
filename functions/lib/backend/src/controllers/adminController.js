"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginHandler = void 0;
const zod_1 = require("zod");
const auth_1 = require("../schemas/auth");
const adminService_1 = require("../services/adminService");
const adminLoginHandler = async (req, res) => {
    try {
        const credentials = auth_1.adminLoginSchema.parse(req.body);
        const result = await (0, adminService_1.authenticateAdmin)(credentials);
        res.json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid login payload', issues: error.issues });
        }
        res.status(401).json({ message: 'Invalid credentials' });
    }
};
exports.adminLoginHandler = adminLoginHandler;
//# sourceMappingURL=adminController.js.map