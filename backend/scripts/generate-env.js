#!/usr/bin/env node

/**
 * Non-interactive script to generate environment variables
 * Usage: node scripts/generate-env.js [admin-password]
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Get password from command line or use default
const password = process.argv[2] || 'admin123';

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Generate admin password hash
bcrypt.hash(password, 10).then((passwordHash) => {
  console.log('\n🔧 Backend Environment Variables\n');
  console.log('='.repeat(60));
  console.log('\n📋 Copy these to Vercel/Railway:\n');
  console.log('NODE_ENV=production');
  console.log('PORT=4000');
  console.log('DATABASE_URL=file:./dev.db');
  console.log('ADMIN_EMAIL=admin@hezak.com');
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Generated!');
  console.log(`\n💡 Admin password: ${password}`);
  console.log('💡 Admin email: admin@hezak.com');
  console.log('\n📝 Instructions:');
  console.log('1. Copy all variables above');
  console.log('2. Go to Vercel/Railway project → Settings → Environment Variables');
  console.log('3. Add each variable');
  console.log('4. Redeploy\n');
});

