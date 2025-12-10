import { getCollection, COLLECTIONS, snapshotToArray, docToObject, toDate, db } from '../../utils/firestore';
import { CategoryInput, UpdateCategoryInput } from '../../schemas/category';

// Firestore Category type
export interface FirestoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isTopSelling: boolean;
  isFeatured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  productIds?: string[]; // Store product IDs directly
}

// Convert Firestore category to API format
const toCategory = async (firestoreCategory: FirestoreCategory, includeProducts = false): Promise<any> => {
  let products: any[] = [];
  let productCount = 0;

  if (includeProducts && firestoreCategory.productIds && firestoreCategory.productIds.length > 0) {
    const productPromises = firestoreCategory.productIds.map(async (productId) => {
      const productDoc = await getCollection(COLLECTIONS.PRODUCTS).doc(productId).get();
      if (productDoc.exists) {
        const productData = productDoc.data();
        return {
          id: productDoc.id,
          name: productData?.name || '',
          itemType: productData?.itemType || ''
        };
      }
      return null;
    });
    
    const productResults = await Promise.all(productPromises);
    products = productResults.filter((p): p is any => p !== null);
  }

  if (!includeProducts && firestoreCategory.productIds) {
    productCount = firestoreCategory.productIds.length;
  }

  return {
    id: parseInt(firestoreCategory.id) || firestoreCategory.id,
    name: firestoreCategory.name,
    slug: firestoreCategory.slug,
    description: firestoreCategory.description,
    isTopSelling: firestoreCategory.isTopSelling || false,
    isFeatured: firestoreCategory.isFeatured || false,
    createdAt: toDate(firestoreCategory.createdAt),
    updatedAt: toDate(firestoreCategory.updatedAt),
    productCount: includeProducts ? products.length : productCount,
    products: includeProducts ? products : undefined,
    _count: { products: includeProducts ? products.length : productCount }
  };
};

export const listCategories = async (options: { includeProducts?: boolean } = {}) => {
  try {
    const categoriesRef = getCollection(COLLECTIONS.CATEGORIES);
    const snapshot = await categoriesRef
      .orderBy('isTopSelling', 'desc')
      .orderBy('name', 'asc')
      .get();

    const categories = snapshotToArray<FirestoreCategory>(snapshot);
    return Promise.all(categories.map((cat) => toCategory(cat, options.includeProducts)));
  } catch (error) {
    console.error('Error in listCategories:', error);
    throw error;
  }
};

export const getCategoryById = async (id: number | string, options: { includeProducts?: boolean } = {}) => {
  try {
    const categoryDoc = await getCollection(COLLECTIONS.CATEGORIES).doc(String(id)).get();
    if (!categoryDoc.exists) {
      return null;
    }

    const category = docToObject<FirestoreCategory>(categoryDoc);
    if (!category) return null;

    return toCategory(category, options.includeProducts);
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    throw error;
  }
};

export const createCategory = async (input: CategoryInput) => {
  try {
    // If setting as top selling, unset any existing top selling category
    if (input.isTopSelling) {
      const topSellingSnapshot = await getCollection(COLLECTIONS.CATEGORIES)
        .where('isTopSelling', '==', true)
        .get();
      
      if (!db) throw new Error('Firestore not initialized');
      const batch = db.batch();
      topSellingSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isTopSelling: false });
      });
      await batch.commit();
    }

    // If setting as featured, unset any existing featured category
    if (input.isFeatured) {
      const featuredSnapshot = await getCollection(COLLECTIONS.CATEGORIES)
        .where('isFeatured', '==', true)
        .get();
      
      if (!db) throw new Error('Firestore not initialized');
      const batch = db.batch();
      featuredSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isFeatured: false });
      });
      await batch.commit();
    }

    const categoryId = Date.now().toString();
    const now = new Date().toISOString();

    const categoryData: Omit<FirestoreCategory, 'id'> = {
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      isTopSelling: input.isTopSelling ?? false,
      isFeatured: input.isFeatured ?? false,
      productIds: [],
      createdAt: now,
      updatedAt: now
    };

    await getCollection(COLLECTIONS.CATEGORIES).doc(categoryId).set(categoryData);

    return getCategoryById(categoryId);
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
};

export const updateCategory = async (id: number, input: UpdateCategoryInput) => {
  try {
    const categoryRef = getCollection(COLLECTIONS.CATEGORIES).doc(String(id));
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      throw new Error('Category not found');
    }

    // If setting as top selling, unset any existing top selling category (except current one)
    if (input.isTopSelling === true) {
      const topSellingSnapshot = await getCollection(COLLECTIONS.CATEGORIES)
        .where('isTopSelling', '==', true)
        .get();
      
      if (!db) throw new Error('Firestore not initialized');
      const batch = db.batch();
      topSellingSnapshot.docs.forEach((doc) => {
        if (doc.id !== String(id)) {
          batch.update(doc.ref, { isTopSelling: false });
        }
      });
      await batch.commit();
    }

    // If setting as featured, unset any existing featured category (except current one)
    if (input.isFeatured === true) {
      const featuredSnapshot = await getCollection(COLLECTIONS.CATEGORIES)
        .where('isFeatured', '==', true)
        .get();
      
      if (!db) throw new Error('Firestore not initialized');
      const batch = db.batch();
      featuredSnapshot.docs.forEach((doc) => {
        if (doc.id !== String(id)) {
          batch.update(doc.ref, { isFeatured: false });
        }
      });
      await batch.commit();
    }

    const updateData: Partial<FirestoreCategory> = {
      updatedAt: new Date().toISOString()
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description === '' ? null : input.description;
    if (input.isTopSelling !== undefined) updateData.isTopSelling = input.isTopSelling;
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;

    await categoryRef.update(updateData);

    return getCategoryById(id);
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number) => {
  try {
    await getCollection(COLLECTIONS.CATEGORIES).doc(String(id)).delete();
    
    // Also remove category from all products
    const productsSnapshot = await getCollection(COLLECTIONS.PRODUCTS).get();
    const { db } = await import('../../utils/firebaseAdmin');
    if (!db) throw new Error('Firestore not initialized');
    const batch = db.batch();
    
    productsSnapshot.docs.forEach((doc) => {
      const productData = doc.data() as any;
      if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
        const updatedCategoryIds = productData.categoryIds.filter((catId: string) => catId !== String(id));
        if (updatedCategoryIds.length !== productData.categoryIds.length) {
          batch.update(doc.ref, { categoryIds: updatedCategoryIds });
        }
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
};

export const setCategoryProducts = async (categoryId: number, productIds: number[]) => {
  try {
    const categoryRef = getCollection(COLLECTIONS.CATEGORIES).doc(String(categoryId));
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      throw new Error(`Category with id ${categoryId} not found`);
    }

    // Convert product IDs to strings
    const productIdStrings = productIds.map((id) => String(id));

    // Update category with product IDs
    await categoryRef.update({
      productIds: productIdStrings,
      updatedAt: new Date().toISOString()
    });

    // Also update products to include this category
    const { db } = await import('../../utils/firebaseAdmin');
    if (!db) throw new Error('Firestore not initialized');
    const batch = db.batch();
    
    // Get all products
    const allProductsSnapshot = await getCollection(COLLECTIONS.PRODUCTS).get();
    
    // Update each product's categoryIds
    allProductsSnapshot.docs.forEach((doc) => {
      const productData = doc.data() as any;
      const currentCategoryIds = (productData.categoryIds || []) as string[];
      const categoryIdString = String(categoryId);
      
      if (productIdStrings.includes(doc.id)) {
        // Product should be in this category
        if (!currentCategoryIds.includes(categoryIdString)) {
          batch.update(doc.ref, {
            categoryIds: [...currentCategoryIds, categoryIdString]
          });
        }
      } else {
        // Product should not be in this category
        if (currentCategoryIds.includes(categoryIdString)) {
          batch.update(doc.ref, {
            categoryIds: currentCategoryIds.filter((id) => id !== categoryIdString)
          });
        }
      }
    });
    
    await batch.commit();

    return getCategoryById(categoryId, { includeProducts: true });
  } catch (error) {
    console.error('Error in setCategoryProducts:', error);
    throw error;
  }
};

