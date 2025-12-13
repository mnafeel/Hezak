"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithGoogle = exports.updateUserProfile = exports.loginUser = exports.registerUser = void 0;
// @ts-nocheck
// @ts-nocheck
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const env_1 = require("../config/env");
const registerUser = async (input) => {
    // Check if user already exists
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: input.email }
    });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    // Hash password
    const passwordHash = await bcrypt_1.default.hash(input.password, 10);
    // Create user
    const user = await prisma_1.prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
            phone: input.phone ?? null
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true
        }
    });
    // Generate token
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email
    }, env_1.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    return {
        user,
        token
    };
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    // Find user
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: input.email }
    });
    if (!user || !user.passwordHash) {
        throw new Error('Invalid email or password');
    }
    // Verify password
    const passwordMatches = await bcrypt_1.default.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
        throw new Error('Invalid email or password');
    }
    // Generate token
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email
    }, env_1.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt
        },
        token
    };
};
exports.loginUser = loginUser;
const updateUserProfile = async (userId, input) => {
    const user = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            name: input.name,
            phone: input.phone ?? null
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true
        }
    });
    return user;
};
exports.updateUserProfile = updateUserProfile;
const loginWithGoogle = async (idToken) => {
    // Verify the ID token with Firebase Admin
    const { verifyIdToken } = await Promise.resolve().then(() => __importStar(require('../utils/firebaseAdmin')));
    const decodedToken = await verifyIdToken(idToken);
    const email = decodedToken.email;
    const name = decodedToken.name || decodedToken.email?.split('@')[0] || 'User';
    if (!email) {
        throw new Error('Email not provided by Google');
    }
    // Check if user exists
    let user = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    // If user doesn't exist, create one
    if (!user) {
        user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                passwordHash: null, // No password for Google users
                phone: null
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true
            }
        });
    }
    else {
        // Update name if it changed
        if (user.name !== name) {
            user = await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { name },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true
                }
            });
        }
    }
    // Generate JWT token
    if (!user) {
        throw new Error('User not found');
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email
    }, env_1.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt
        },
        token
    };
};
exports.loginWithGoogle = loginWithGoogle;
//# sourceMappingURL=userAuthService.js.map