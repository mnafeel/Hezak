import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and either:
// 1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
// 2. Or provide the service account JSON directly

let firebaseAdmin: admin.app.App | null = null;

try {
  // Try to initialize with service account from environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined // Optional: for Firebase Storage
    });
    console.log('✅ Firebase Admin initialized successfully');
    if (process.env.FIREBASE_STORAGE_BUCKET) {
      console.log(`✅ Firebase Storage bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use service account file path
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    // For development, you can use a service account file
    // In production, use environment variables
    console.warn('⚠️ Firebase Admin not initialized. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS environment variable.');
    console.warn('⚠️ Google login and Firebase Storage will not work without Firebase Admin.');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Export Firestore database instance
export const db = firebaseAdmin ? getFirestore(firebaseAdmin) : null;

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
export const storage = firebaseAdmin ? getStorage(firebaseAdmin) : null;

export const verifyIdToken = async (idToken: string) => {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin not initialized. Please configure FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.');
  }
  
  try {
    const decodedToken = await admin.auth(firebaseAdmin).verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
};

export default firebaseAdmin;

