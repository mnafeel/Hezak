import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and either:
// 1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
// 2. Or provide the service account JSON directly

// In Firebase Functions, admin is auto-initialized
// Just ensure it's initialized (safe to call multiple times)
if (!admin.apps.length) {
  admin.initializeApp();
  console.log('✅ Firebase Admin initialized (Firebase Functions)');
}

// Get Firestore and Storage instances
let firebaseAdmin: admin.app.App = admin.app();

// Export Firestore database instance
export const db = getFirestore(firebaseAdmin);

// Export Realtime Database instance (if needed and configured)
// Only initialize if database URL is provided (we're using Firestore, so this is optional)
let realtimeDbInstance: ReturnType<typeof getDatabase> | null = null;
try {
  if (firebaseAdmin && process.env.FIREBASE_DATABASE_URL) {
    realtimeDbInstance = getDatabase(firebaseAdmin);
  }
} catch (error) {
  // Realtime Database not configured - that's fine, we're using Firestore
  console.log('ℹ️ Realtime Database not configured (using Firestore)');
}
export const realtimeDb = realtimeDbInstance;

// Export Storage instance
export const storage = getStorage(firebaseAdmin).bucket();

export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
};

export default firebaseAdmin;

