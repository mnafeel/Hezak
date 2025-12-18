import { getCollection, COLLECTIONS, snapshotToArray, docToObject, toDate, toTimestamp } from '../../utils/firestore';
import { BannerInput } from '../bannerService';

// Firestore Banner type
export interface FirestoreBanner {
  id: string;
  title?: string | null;
  text?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  mediaType?: 'image' | 'video';
  linkUrl?: string | null;
  order: number;
  isActive: boolean;
  textPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | null;
  textAlign?: 'left' | 'center' | 'right' | null;
  animationStyle?: 'fade' | 'slide' | 'zoom' | 'none' | null;
  overlayStyle?: 'gradient' | 'solid' | 'blur' | 'none' | null;
  textElements?: any;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Convert Firestore banner to API format
const toBanner = (firestoreBanner: FirestoreBanner): any => {
  return {
    id: parseInt(firestoreBanner.id) || firestoreBanner.id,
    title: firestoreBanner.title || null,
    text: firestoreBanner.text || null,
    imageUrl: firestoreBanner.imageUrl || null,
    videoUrl: firestoreBanner.videoUrl || null,
    mediaType: firestoreBanner.mediaType || 'image',
    linkUrl: firestoreBanner.linkUrl || null,
    order: firestoreBanner.order ?? 0,
    isActive: firestoreBanner.isActive ?? true,
    textPosition: firestoreBanner.textPosition || 'bottom-left',
    textAlign: firestoreBanner.textAlign || 'left',
    animationStyle: firestoreBanner.animationStyle || 'fade',
    overlayStyle: firestoreBanner.overlayStyle || 'gradient',
    textElements: firestoreBanner.textElements || [],
    createdAt: toDate(firestoreBanner.createdAt),
    updatedAt: firestoreBanner.updatedAt ? toDate(firestoreBanner.updatedAt) : toDate(firestoreBanner.createdAt)
  };
};

export const getAllBannersFirestore = async () => {
  try {
    // First try with orderBy (requires index)
    try {
      const bannersSnapshot = await getCollection(COLLECTIONS.BANNERS)
        .orderBy('order', 'asc')
        .get();

      const banners = snapshotToArray<FirestoreBanner>(bannersSnapshot);
      // Sort by createdAt desc in memory for same order values
      const sortedBanners = banners.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        const aDate = toDate(a.createdAt).getTime();
        const bDate = toDate(b.createdAt).getTime();
        return bDate - aDate; // Descending by createdAt
      });
      return sortedBanners.map(toBanner);
    } catch (error: any) {
      // If index doesn't exist, fetch all and sort in memory
      if (error?.code === 9 || error?.message?.includes('index')) {
        console.log('⚠️ Firestore index not found, fetching all banners and sorting in memory');
        const bannersSnapshot = await getCollection(COLLECTIONS.BANNERS).get();
        const banners = snapshotToArray<FirestoreBanner>(bannersSnapshot);
        // Sort by order, then by createdAt desc
        const sortedBanners = banners.sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          const aDate = toDate(a.createdAt).getTime();
          const bDate = toDate(b.createdAt).getTime();
          return bDate - aDate; // Descending by createdAt
        });
        return sortedBanners.map(toBanner);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching banners from Firestore:', error);
    throw error;
  }
};

export const getActiveBannersFirestore = async () => {
  try {
    // First try with orderBy (requires index)
    try {
      const bannersSnapshot = await getCollection(COLLECTIONS.BANNERS)
        .where('isActive', '==', true)
        .orderBy('order', 'asc')
        .get();

      const banners = snapshotToArray<FirestoreBanner>(bannersSnapshot);
      return banners.map(toBanner);
    } catch (error: any) {
      // If index doesn't exist, fetch all and sort in memory
      if (error?.code === 9 || error?.message?.includes('index')) {
        console.log('⚠️ Firestore index not found, fetching all active banners and sorting in memory');
        const bannersSnapshot = await getCollection(COLLECTIONS.BANNERS)
          .where('isActive', '==', true)
          .get();

        const banners = snapshotToArray<FirestoreBanner>(bannersSnapshot);
        // Sort by order, then by createdAt desc
        const sortedBanners = banners.sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          const aDate = toDate(a.createdAt).getTime();
          const bDate = toDate(b.createdAt).getTime();
          return bDate - aDate; // Descending by createdAt
        });
        return sortedBanners.map(toBanner);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching active banners from Firestore:', error);
    throw error;
  }
};

export const getBannerByIdFirestore = async (id: number) => {
  const bannerDoc = await getCollection(COLLECTIONS.BANNERS).doc(String(id)).get();
  
  if (!bannerDoc.exists) {
    return null;
  }

  const banner = docToObject<FirestoreBanner>(bannerDoc);
  return banner ? toBanner(banner) : null;
};

export const createBannerFirestore = async (data: BannerInput) => {
  // Get the highest order value - handle missing index gracefully
  let nextOrder = 0;
  try {
    try {
      const bannersSnapshot = await getCollection(COLLECTIONS.BANNERS)
        .orderBy('order', 'desc')
        .limit(1)
        .get();

      if (!bannersSnapshot.empty) {
        const maxBanner = bannersSnapshot.docs[0].data();
        nextOrder = (maxBanner.order ?? -1) + 1;
      }
    } catch (error: any) {
      // If index doesn't exist, fetch all and find max in memory
      if (error?.code === 9 || error?.message?.includes('index')) {
        console.log('⚠️ Firestore index not found for order, fetching all banners to find max order');
        const allBannersSnapshot = await getCollection(COLLECTIONS.BANNERS).get();
        if (!allBannersSnapshot.empty) {
          const allBanners = snapshotToArray<FirestoreBanner>(allBannersSnapshot);
          const maxOrder = Math.max(...allBanners.map(b => b.order ?? 0), -1);
          nextOrder = maxOrder + 1;
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.warn('Error getting max order, using 0:', error);
    nextOrder = 0;
  }

  const bannerId = Date.now().toString();
  const bannerData: any = {
    id: parseInt(bannerId) || bannerId,
    title: data.title || null,
    text: data.text || null,
    imageUrl: data.imageUrl || null,
    videoUrl: data.videoUrl || null,
    mediaType: data.mediaType || 'image',
    linkUrl: data.linkUrl || null,
    order: data.order ?? nextOrder,
    isActive: data.isActive ?? true,
    textPosition: data.textPosition || 'bottom-left',
    textAlign: data.textAlign || 'left',
    animationStyle: data.animationStyle || 'fade',
    overlayStyle: data.overlayStyle || 'gradient',
    textElements: data.textElements || [],
    createdAt: toTimestamp(new Date()),
    updatedAt: toTimestamp(new Date())
  };

  console.log('📝 Creating banner in Firestore:', { bannerId, bannerData });

  await getCollection(COLLECTIONS.BANNERS).doc(bannerId).set(bannerData);

  // Fetch the created banner to return it
  const createdBannerDoc = await getCollection(COLLECTIONS.BANNERS).doc(bannerId).get();
  
  if (!createdBannerDoc.exists) {
    console.error('❌ Banner was not created in Firestore');
    throw new Error('Failed to create banner');
  }

  const banner = docToObject<FirestoreBanner>(createdBannerDoc);
  if (!banner) {
    console.error('❌ Failed to parse created banner');
    throw new Error('Failed to parse created banner');
  }

  console.log('✅ Banner created successfully:', banner.id);
  return toBanner(banner);
};

export const updateBannerFirestore = async (id: number, data: Partial<BannerInput>) => {
  const bannerRef = getCollection(COLLECTIONS.BANNERS).doc(String(id));
  const bannerDoc = await bannerRef.get();

  if (!bannerDoc.exists) {
    throw new Error('Banner not found');
  }

  const updateData: any = {
    updatedAt: toTimestamp(new Date())
  };

  if (data.title !== undefined) updateData.title = data.title || null;
  if (data.text !== undefined) updateData.text = data.text || null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
  if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl || null;
  if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl || null;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.textPosition !== undefined) updateData.textPosition = data.textPosition || null;
  if (data.textAlign !== undefined) updateData.textAlign = data.textAlign || null;
  if (data.animationStyle !== undefined) updateData.animationStyle = data.animationStyle || null;
  if (data.overlayStyle !== undefined) updateData.overlayStyle = data.overlayStyle || null;
  if (data.textElements !== undefined) updateData.textElements = data.textElements || [];

  await bannerRef.update(updateData);

  const updatedBanner = await bannerRef.get();
  const banner = docToObject<FirestoreBanner>(updatedBanner);
  return banner ? toBanner(banner) : null;
};

export const deleteBannerFirestore = async (id: number) => {
  const bannerRef = getCollection(COLLECTIONS.BANNERS).doc(String(id));
  const bannerDoc = await bannerRef.get();

  if (!bannerDoc.exists) {
    throw new Error('Banner not found');
  }

  await bannerRef.delete();
};

export const reorderBannersFirestore = async (bannerOrders: Array<{ id: number; order: number }>) => {
  const updates = bannerOrders.map(({ id, order }) =>
    getCollection(COLLECTIONS.BANNERS).doc(String(id)).update({
      order,
      updatedAt: toTimestamp(new Date())
    })
  );

  await Promise.all(updates);
  return getAllBannersFirestore();
};

