#!/usr/bin/env node

/**
 * Script to help set up environment variables for deployment
 * This generates the required values for Vercel/Railway
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

console.log('\n🔧 Backend Environment Variables Setup\n');
console.log('='.repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ JWT_SECRET (copy this):');
console.log(jwtSecret);

// Generate admin password hash
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n📝 Enter admin password (will be hashed): ', async (password) => {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  console.log('\n✅ ADMIN_PASSWORD_HASH (copy this):');
  console.log(passwordHash);
  
  console.log('\n📋 Required Environment Variables for Vercel/Railway:\n');
  console.log('='.repeat(60));
  console.log(`NODE_ENV=production`);
  console.log(`PORT=4000`);
  console.log(`DATABASE_URL=file:./dev.db`);
  console.log(`ADMIN_EMAIL=admin@hezak.com`);
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log('='.repeat(60));
  
  console.log('\n💡 Instructions:');
  console.log('1. Copy all the variables above');
  console.log('2. Go to your Vercel/Railway project');
  console.log('3. Settings → Environment Variables');
  console.log('4. Add each variable');
  console.log('5. Redeploy\n');
  
  rl.close();
});

