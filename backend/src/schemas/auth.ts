import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const userRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional()
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type UserLoginInput = z.infer<typeof userLoginSchema>;

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional().nullable()
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'ID token is required')
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

