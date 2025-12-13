// @ts-nocheck
import { prisma } from '../utils/prisma';

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

