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
  const bannersSnapshot = await getCollection(COLLECTIONS.BANNERS)
    .orderBy('order', 'asc')
    .orderBy('createdAt', 'desc')
    .get();

  const banners = snapshotToArray<FirestoreBanner>(bannersSnapshot);
  return banners.map(toBanner);
};

export const getActiveBannersFirestore = async () => {
  const bannersSnapshot = await getCollection(COLLECTIONS.BANNERS)
    .where('isActive', '==', true)
    .orderBy('order', 'asc')
    .get();

  const banners = snapshotToArray<FirestoreBanner>(bannersSnapshot);
  // Sort by createdAt desc in memory (Firestore doesn't support multiple orderBy without index)
  const sortedBanners = banners.sort((a, b) => {
    const aDate = toDate(a.createdAt).getTime();
    const bDate = toDate(b.createdAt).getTime();
    if (a.order === b.order) {
      return bDate - aDate; // Descending by createdAt
    }
    return 0; // Already sorted by order
  });
  return sortedBanners.map(toBanner);
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
  // Get the highest order value
  const bannersSnapshot = await getCollection(COLLECTIONS.BANNERS)
    .orderBy('order', 'desc')
    .limit(1)
    .get();

  let nextOrder = 0;
  if (!bannersSnapshot.empty) {
    const maxBanner = bannersSnapshot.docs[0].data();
    nextOrder = (maxBanner.order ?? -1) + 1;
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

  await getCollection(COLLECTIONS.BANNERS).doc(bannerId).set(bannerData);

  const createdBanner = await getCollection(COLLECTIONS.BANNERS).doc(bannerId).get();
  const banner = docToObject<FirestoreBanner>(createdBanner);
  return banner ? toBanner(banner) : null;
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

