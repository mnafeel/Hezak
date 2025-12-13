"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.listUsers = void 0;
// @ts-nocheck
const prisma_1 = require("../utils/prisma");
const listUsers = async () => {
    const users = await prisma_1.prisma.user.findMany({
        include: {
            orders: {
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return users;
};
exports.listUsers = listUsers;
const getUserById = async (id) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
        include: {
            orders: {
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
exports.getUserById = getUserById;
//# sourceMappingURL=userService.js.map