import { z } from 'zod';

export const siteSettingsSchema = z.object({
  // Text Content
  siteName: z.string().optional(),
  welcomeTitle: z.string().optional(),
  welcomeSubtitle: z.string().optional(),
  browseAllTitle: z.string().optional(),
  browseAllDescription: z.string().optional(),
  topPicksTitle: z.string().optional(),
  topPicksDescription: z.string().optional(),
  featuredTitle: z.string().optional(),
  featuredDescription: z.string().optional(),
  topSellingTitle: z.string().optional(),
  topSellingDescription: z.string().optional(),
  shopNowText: z.string().optional(),
  viewAllText: z.string().optional(),
  discoverText: z.string().optional(),
  startShoppingText: z.string().optional(),
  
  // Premium Style Options
  headingFontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  bodyFontSize: z.enum(['small', 'medium', 'large']).optional(),
  cardSpacing: z.enum(['compact', 'normal', 'spacious']).optional(),
  animationSpeed: z.enum(['slow', 'normal', 'fast']).optional(),
  shadowIntensity: z.enum(['subtle', 'normal', 'dramatic']).optional(),
  borderRadius: z.enum(['small', 'medium', 'large', 'xl']).optional(),
  hoverEffect: z.enum(['none', 'subtle', 'moderate', 'strong']).optional(),
  gradientIntensity: z.enum(['light', 'medium', 'strong']).optional(),
}).partial();

