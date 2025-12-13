"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.getAllUsers = void 0;
const userService_1 = require("../services/userService");
const userSerializers_1 = require("../utils/userSerializers");
const getAllUsers = async (req, res) => {
    try {
        const users = await (0, userService_1.listUsers)();
        const serialized = users.map(userSerializers_1.serializeUser);
        // Filter out invalid users (missing required fields)
        const validUsers = serialized.filter((user) => user &&
            user.id &&
            user.name &&
            typeof user.name === 'string' &&
            user.name.trim() !== '' &&
            user.name !== 'Invalid User' &&
            user.email &&
            typeof user.email === 'string' &&
            user.email.trim() !== '' &&
            user.email !== 'invalid@example.com');
        if (serialized.length !== validUsers.length) {
            console.warn(`Filtered out ${serialized.length - validUsers.length} invalid user(s) from response`);
        }
        res.json(validUsers);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
const getUser = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const user = await (0, userService_1.getUserById)(id);
        const serialized = (0, userSerializers_1.serializeUser)(user);
        res.json(serialized);
    }
    catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        }
        else {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    }
};
exports.getUser = getUser;
//# sourceMappingURL=userController.js.map