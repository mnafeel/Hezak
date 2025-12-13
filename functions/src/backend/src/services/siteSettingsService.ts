import { prisma } from '../utils/prisma';

export interface SiteSettingsData {
  // Text Content
  siteName?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  browseAllTitle?: string;
  browseAllDescription?: string;
  topPicksTitle?: string;
  topPicksDescription?: string;
  featuredTitle?: string;
  featuredDescription?: string;
  topSellingTitle?: string;
  topSellingDescription?: string;
  shopNowText?: string;
  viewAllText?: string;
  discoverText?: string;
  startShoppingText?: string;
  
  // Premium Style Options
  headingFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  bodyFontSize?: 'small' | 'medium' | 'large';
  cardSpacing?: 'compact' | 'normal' | 'spacious';
  animationSpeed?: 'slow' | 'normal' | 'fast';
  shadowIntensity?: 'subtle' | 'normal' | 'dramatic';
  borderRadius?: 'small' | 'medium' | 'large' | 'xl';
  hoverEffect?: 'none' | 'subtle' | 'moderate' | 'strong';
  gradientIntensity?: 'light' | 'medium' | 'strong';
}

const DEFAULT_SETTINGS: SiteSettingsData = {
  siteName: 'Hezak Boutique',
  welcomeTitle: 'Welcome to Hezak Boutique',
  welcomeSubtitle: 'Your premium shopping destination. Start adding products to see them here.',
  browseAllTitle: 'Browse All Products',
  browseAllDescription: 'Explore our complete collection',
  topPicksTitle: 'Top Picks',
  topPicksDescription: "See what's trending",
  featuredTitle: 'Featured Collection',
  featuredDescription: 'Handpicked premium selections',
  topSellingTitle: '🔥 Top Selling',
  topSellingDescription: 'Our most popular items, loved by customers worldwide',
  shopNowText: 'Shop Now',
  viewAllText: 'View All',
  discoverText: 'Discover',
  startShoppingText: 'Start Shopping',
  headingFontSize: 'large',
  bodyFontSize: 'medium',
  cardSpacing: 'normal',
  animationSpeed: 'normal',
  shadowIntensity: 'normal',
  borderRadius: 'large',
  hoverEffect: 'moderate',
  gradientIntensity: 'medium',
};

const SETTINGS_KEY = 'siteSettings';

export const getSiteSettings = async (): Promise<SiteSettingsData> => {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: SETTINGS_KEY }
  });

  if (!setting) {
    // Initialize with defaults
    await prisma.siteSettings.create({
      data: {
        key: SETTINGS_KEY,
        value: JSON.stringify(DEFAULT_SETTINGS)
      }
    });
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(setting.value) as SiteSettingsData;
    // Merge with defaults to ensure all fields exist
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const updateSiteSettings = async (data: Partial<SiteSettingsData>): Promise<SiteSettingsData> => {
  const current = await getSiteSettings();
  const updated = { ...current, ...data };

  await prisma.siteSettings.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      value: JSON.stringify(updated)
    },
    update: {
      value: JSON.stringify(updated)
    }
  });

  return updated;
};

