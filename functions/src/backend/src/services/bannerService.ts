// @ts-nocheck
import { prisma } from '../utils/prisma';

export interface BannerInput {
  title?: string | null;
  text?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  mediaType?: 'image' | 'video';
  linkUrl?: string | null;
  order?: number;
  isActive?: boolean;
  textPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | null;
  textAlign?: 'left' | 'center' | 'right' | null;
  animationStyle?: 'fade' | 'slide' | 'zoom' | 'none' | null;
  overlayStyle?: 'gradient' | 'solid' | 'blur' | 'none' | null;
  textElements?: any; // JSON array of text elements
}

export interface BannerUpdate extends Partial<BannerInput> {
  id: number;
}

export const getAllBanners = async () => {
  try {
    // First, try to fix any corrupted textElements
    try {
      await prisma.$executeRaw`UPDATE Banner SET textElements = '[]' WHERE textElements IS NULL OR textElements = '' OR textElements = 'null'`;
    } catch (fixError) {
      console.warn('Could not fix corrupted textElements:', fixError);
    }
    
    const banners = await prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    
    return banners;
  } catch (error) {
    console.error('Error in getAllBanners:', error);
    // If there's a data corruption error, try to fix it
    if (error instanceof Error && error.message.includes('Conversion failed')) {
      try {
        await prisma.$executeRaw`UPDATE Banner SET textElements = '[]' WHERE textElements IS NULL OR textElements = '' OR textElements = 'null'`;
        // Retry after fixing
        return await prisma.banner.findMany({
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });
      } catch (retryError) {
        console.error('Retry after fix failed:', retryError);
        // Return empty array as fallback
        return [];
      }
    }
    throw error;
  }
};

export const getActiveBanners = async () => {
  try {
    // First, try to fix any corrupted textElements
    try {
      await prisma.$executeRaw`UPDATE Banner SET textElements = '[]' WHERE textElements IS NULL OR textElements = '' OR textElements = 'null'`;
    } catch (fixError) {
      console.warn('Could not fix corrupted textElements:', fixError);
    }
    
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    
    return banners;
  } catch (error) {
    console.error('Error in getActiveBanners:', error);
    // If there's a data corruption error, try to fix it
    if (error instanceof Error && error.message.includes('Conversion failed')) {
      try {
        await prisma.$executeRaw`UPDATE Banner SET textElements = '[]' WHERE textElements IS NULL OR textElements = '' OR textElements = 'null'`;
        // Retry after fixing
        return await prisma.banner.findMany({
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        });
      } catch (retryError) {
        console.error('Retry after fix failed:', retryError);
        // Return empty array as fallback
        return [];
      }
    }
    throw error;
  }
};

export const getBannerById = async (id: number) => {
  return prisma.banner.findUnique({
    where: { id }
  });
};

export const createBanner = async (data: BannerInput) => {
  // Get the highest order value
  const maxOrder = await prisma.banner.aggregate({
    _max: { order: true }
  });
  
  const nextOrder = (maxOrder._max.order ?? -1) + 1;
  
  // For create, imageUrl is required (non-nullable in Prisma)
  // Use videoUrl if mediaType is video and imageUrl is not provided
  const finalImageUrl = (data.imageUrl && data.imageUrl.trim().length > 0) 
    ? data.imageUrl 
    : ((data.mediaType === 'video' && data.videoUrl) ? '' : (data.imageUrl || ''));
  
  return prisma.banner.create({
      data: {
        ...data,
        order: data.order ?? nextOrder,
        title: data.title || null,
        text: data.text || null,
        imageUrl: finalImageUrl, // Required field, use empty string for video banners
        videoUrl: data.videoUrl || null,
        mediaType: data.mediaType || 'image',
        linkUrl: data.linkUrl || null,
        isActive: data.isActive ?? true,
        textPosition: data.textPosition || 'bottom-left',
        textAlign: data.textAlign || 'left',
        animationStyle: data.animationStyle || 'fade',
        overlayStyle: data.overlayStyle || 'gradient',
        textElements: data.textElements || []
      }
    });
};

export const updateBanner = async (id: number, data: Partial<BannerInput>) => {
  // Build update data, only including fields that are explicitly provided
  const updateData: any = {};
  
  if (data.title !== undefined) updateData.title = data.title || null;
  if (data.text !== undefined) updateData.text = data.text || null;
  if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl || null;
  if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl || null;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.textPosition !== undefined) updateData.textPosition = data.textPosition || null;
  if (data.textAlign !== undefined) updateData.textAlign = data.textAlign || null;
  if (data.animationStyle !== undefined) updateData.animationStyle = data.animationStyle || null;
  if (data.overlayStyle !== undefined) updateData.overlayStyle = data.overlayStyle || null;
  if (data.textElements !== undefined) updateData.textElements = data.textElements;
  
  // Only update imageUrl if explicitly provided (and convert null to empty string for Prisma)
  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl || '';
  }
  
  return prisma.banner.update({
    where: { id },
    data: updateData
  });
};

export const deleteBanner = async (id: number) => {
  return prisma.banner.delete({
    where: { id }
  });
};

export const reorderBanners = async (bannerOrders: Array<{ id: number; order: number }>) => {
  const updates = bannerOrders.map(({ id, order }) =>
    prisma.banner.update({
      where: { id },
      data: { order }
    })
  );
  
  await Promise.all(updates);
  return getAllBanners();
};

