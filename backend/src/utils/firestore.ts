import { db } from './firebaseAdmin';
import type { Firestore } from 'firebase-admin/firestore';

if (!db) {
  console.warn('⚠️ Firestore database not initialized. Please configure FIREBASE_SERVICE_ACCOUNT.');
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'productCategories',
  ORDERS: 'orders',
  ORDER_ITEMS: 'orderItems',
  BANNERS: 'banners',
  APP_SETTINGS: 'appSettings',
  SITE_SETTINGS: 'siteSettings'
} as const;

// Helper to get collection reference
export const getCollection = (collectionName: string) => {
  if (!db) {
    throw new Error('Firestore database not initialized. Please configure FIREBASE_SERVICE_ACCOUNT environment variable.');
  }
  return db.collection(collectionName);
};

// Helper to convert Firestore timestamp to Date
export const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return new Date();
};

// Helper to convert Date to Firestore timestamp
export const toTimestamp = (date: Date | string | undefined): any => {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d instanceof Date ? d.toISOString() : null;
};

// Helper to generate ID (Firestore auto-generates, but we'll use string IDs)
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Helper to convert Firestore document to plain object
export const docToObject = <T>(doc: FirebaseFirestore.DocumentSnapshot): T | null => {
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data) return null;
  return {
    id: doc.id,
    ...data
  } as T;
};

// Helper to convert Firestore query snapshot to array
export const snapshotToArray = <T>(snapshot: any): T[] => {
  if (!snapshot || !snapshot.docs) return [];
  return snapshot.docs.map((doc: any) => docToObject<T>(doc)).filter((item): item is T => item !== null);
};

export { db };

