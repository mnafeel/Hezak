// @ts-nocheck
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { env } from '../config/env';
import { UserRegisterInput, UserLoginInput, UpdateUserProfileInput } from '../schemas/auth';

export const registerUser = async (input: UserRegisterInput) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 10);

  // Create user
  const user = await prisma.user.create({
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
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );

  return {
    user,
    token
  };
};

export const loginUser = async (input: UserLoginInput) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );

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

export const updateUserProfile = async (userId: number, input: UpdateUserProfileInput) => {
  const user = await prisma.user.update({
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

export const loginWithGoogle = async (idToken: string) => {
  // Verify the ID token with Firebase Admin
  const { verifyIdToken } = await import('../utils/firebaseAdmin');
  const decodedToken = await verifyIdToken(idToken);
  
  const email = decodedToken.email;
  const name = decodedToken.name || decodedToken.email?.split('@')[0] || 'User';
  
  if (!email) {
    throw new Error('Email not provided by Google');
  }

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email }
  });

  // If user doesn't exist, create one
  if (!user) {
    user = await prisma.user.create({
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
  } else {
    // Update name if it changed
    if (user.name !== name) {
      user = await prisma.user.update({
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

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );

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

