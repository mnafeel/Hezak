// Database configuration - switch between Prisma (SQLite) and Firestore
export const USE_FIRESTORE = process.env.USE_FIRESTORE === 'true';

// Log which database is being used
if (USE_FIRESTORE) {
  console.log('🔥 Using Firebase Firestore');
} else {
  console.log('💾 Using SQLite (Prisma)');
}

