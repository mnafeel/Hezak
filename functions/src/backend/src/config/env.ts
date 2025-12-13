import 'dotenv/config';
import { z } from 'zod';

// In Firebase Functions, use functions.config() or process.env
// Make DATABASE_URL optional since we're using Firestore
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .optional()
    .default('4000'),
  DATABASE_URL: z.string().optional(), // Optional in Firebase Functions (using Firestore)
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email address').optional(),
  ADMIN_PASSWORD_HASH: z
    .string()
    .min(10, 'ADMIN_PASSWORD_HASH must be a valid bcrypt hash')
    .optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long').optional()
});

// In Firebase Functions, try functions.config() first, then process.env
let config: any = {};
try {
  // Try Firebase Functions config
  const functions = require('firebase-functions');
  config = functions.config();
} catch {
  // Not in Firebase Functions environment, use process.env
  config = process.env;
}

const parsed = envSchema.safeParse({
  ...config,
  ...process.env
});

// In Firebase Functions, don't exit on validation errors - use defaults
if (!parsed.success) {
  console.warn('⚠️ Some environment variables missing, using defaults:', parsed.error.format());
}

export const env = {
  NODE_ENV: parsed.data?.NODE_ENV || 'production',
  PORT: Number(parsed.data?.PORT || 4000),
  DATABASE_URL: parsed.data?.DATABASE_URL || 'file:./dev.db', // Not used in Firestore
  ADMIN_EMAIL: parsed.data?.ADMIN_EMAIL || config.admin?.email || process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD_HASH: parsed.data?.ADMIN_PASSWORD_HASH || config.admin?.password_hash || process.env.ADMIN_PASSWORD_HASH || '',
  JWT_SECRET: parsed.data?.JWT_SECRET || config.jwt?.secret || process.env.JWT_SECRET || 'default-secret-change-in-production'
};


