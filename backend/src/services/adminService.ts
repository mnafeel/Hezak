import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AdminLoginInput } from '../schemas/auth';

export const authenticateAdmin = async (input: AdminLoginInput) => {
  if (input.email !== env.ADMIN_EMAIL) {
    throw new Error('Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(input.password, env.ADMIN_PASSWORD_HASH);

  if (!passwordMatches) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    {
      email: env.ADMIN_EMAIL
    },
    env.JWT_SECRET,
    {
      expiresIn: '8h'
    }
  );

  return {
    token
  };
};


