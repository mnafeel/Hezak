import { prisma } from '../utils/prisma';
import { USE_FIRESTORE } from '../config/database';
import { db } from '../utils/firebaseAdmin';
import { COLLECTIONS } from '../utils/firestore';

const ADMIN_PATH_KEY = 'adminPathSlug';
const DEFAULT_ADMIN_PATH = 'admin';

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

const ensureDefaultAdminPath = async () => {
  await prisma.appSetting.upsert({
    where: { key: ADMIN_PATH_KEY },
    create: {
      key: ADMIN_PATH_KEY,
      value: DEFAULT_ADMIN_PATH
    },
    update: {}
  });
};

export const getAdminPathSlug = async (): Promise<string> => {
  const setting = await prisma.appSetting.findUnique({
    where: { key: ADMIN_PATH_KEY }
  });

  if (!setting) {
    await ensureDefaultAdminPath();
    return DEFAULT_ADMIN_PATH;
  }

  return normalizeSlug(setting.value);
};

export const updateAdminPathSlug = async (slug: string): Promise<string> => {
  const normalized = normalizeSlug(slug);

  const updated = await prisma.appSetting.upsert({
    where: { key: ADMIN_PATH_KEY },
    create: {
      key: ADMIN_PATH_KEY,
      value: normalized
    },
    update: {
      value: normalized
    }
  });

  return normalizeSlug(updated.value);
};

const FEATURED_COUNT_KEY = 'featuredItemsCount';
const DEFAULT_FEATURED_COUNT = 3;

const ensureDefaultFeaturedCount = async () => {
  await prisma.appSetting.upsert({
    where: { key: FEATURED_COUNT_KEY },
    create: {
      key: FEATURED_COUNT_KEY,
      value: String(DEFAULT_FEATURED_COUNT)
    },
    update: {}
  });
};

export const getFeaturedItemsCount = async (): Promise<number> => {
  const setting = await prisma.appSetting.findUnique({
    where: { key: FEATURED_COUNT_KEY }
  });

  if (!setting) {
    await ensureDefaultFeaturedCount();
    return DEFAULT_FEATURED_COUNT;
  }

  const count = parseInt(setting.value, 10);
  return isNaN(count) || count < 1 ? DEFAULT_FEATURED_COUNT : Math.min(count, 20);
};

export const updateFeaturedItemsCount = async (count: number): Promise<number> => {
  const normalized = Math.max(1, Math.min(20, Math.round(count)));

  const updated = await prisma.appSetting.upsert({
    where: { key: FEATURED_COUNT_KEY },
    create: {
      key: FEATURED_COUNT_KEY,
      value: String(normalized)
    },
    update: {
      value: String(normalized)
    }
  });

  return parseInt(updated.value, 10);
};

const STORE_NAME_KEY = 'storeName';
const DEFAULT_STORE_NAME = 'Hezak Boutique';

const ensureDefaultStoreName = async () => {
  await prisma.appSetting.upsert({
    where: { key: STORE_NAME_KEY },
    create: {
      key: STORE_NAME_KEY,
      value: DEFAULT_STORE_NAME
    },
    update: {}
  });
};

export const getStoreName = async (): Promise<string> => {
  if (USE_FIRESTORE) {
    try {
      const settingsRef = db.collection(COLLECTIONS.APP_SETTINGS);
      const doc = await settingsRef.doc(STORE_NAME_KEY).get();
      
      if (doc.exists) {
        return doc.data()?.value || DEFAULT_STORE_NAME;
      }
      
      // Create default if doesn't exist
      await settingsRef.doc(STORE_NAME_KEY).set({
        key: STORE_NAME_KEY,
        value: DEFAULT_STORE_NAME,
        updatedAt: new Date()
      });
      
      return DEFAULT_STORE_NAME;
    } catch (error) {
      console.error('Error getting store name from Firestore:', error);
      return DEFAULT_STORE_NAME;
    }
  }

  const setting = await prisma.appSetting.findUnique({
    where: { key: STORE_NAME_KEY }
  });

  if (!setting) {
    await ensureDefaultStoreName();
    return DEFAULT_STORE_NAME;
  }

  return setting.value || DEFAULT_STORE_NAME;
};

export const updateStoreName = async (name: string): Promise<string> => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Store name cannot be empty');
  }

  if (USE_FIRESTORE) {
    try {
      const settingsRef = db.collection(COLLECTIONS.APP_SETTINGS);
      await settingsRef.doc(STORE_NAME_KEY).set({
        key: STORE_NAME_KEY,
        value: trimmed,
        updatedAt: new Date()
      }, { merge: true });
      
      return trimmed;
    } catch (error) {
      console.error('Error updating store name in Firestore:', error);
      throw new Error('Failed to update store name');
    }
  }

  const updated = await prisma.appSetting.upsert({
    where: { key: STORE_NAME_KEY },
    create: {
      key: STORE_NAME_KEY,
      value: trimmed
    },
    update: {
      value: trimmed
    }
  });

  return updated.value;
};

