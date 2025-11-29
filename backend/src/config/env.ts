import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .default('4000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email address'),
  ADMIN_PASSWORD_HASH: z
    .string()
    .min(10, 'ADMIN_PASSWORD_HASH must be a valid bcrypt hash'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT)
};


