import { getCollection, COLLECTIONS, snapshotToArray, docToObject, toDate } from '../../utils/firestore';
import { db } from '../../utils/firebaseAdmin';
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

  // Get unique, valid product IDs - exclude category ID and empty strings
  const categoryIdString = String(firestoreCategory.id);
  const uniqueProductIds = firestoreCategory.productIds 
    ? [...new Set(firestoreCategory.productIds.filter(id => {
        const idStr = String(id).trim();
        // Exclude empty strings and the category ID itself
        return idStr !== '' && idStr !== categoryIdString;
      }))]
    : [];

  if (includeProducts && uniqueProductIds.length > 0) {
    const productPromises = uniqueProductIds.map(async (productId) => {
      const productDoc = await getCollection(COLLECTIONS.PRODUCTS).doc(String(productId)).get();
      if (productDoc.exists) {
        const productData = productDoc.data();
        return {
          id: parseInt(productDoc.id) || productDoc.id, // Return numeric ID if possible
          name: productData?.name || '',
          itemType: productData?.itemType || ''
        };
      }
      return null;
    });
    
    const productResults = await Promise.all(productPromises);
    products = productResults.filter((p): p is any => p !== null);
    productCount = products.length;
  } else if (!includeProducts && uniqueProductIds.length > 0) {
    // Verify products exist and count only valid ones
    const productExistencePromises = uniqueProductIds.map(async (productId) => {
      const productDoc = await getCollection(COLLECTIONS.PRODUCTS).doc(String(productId)).get();
      return productDoc.exists;
    });
    
    const productExistenceResults = await Promise.all(productExistencePromises);
    productCount = productExistenceResults.filter(exists => exists).length;
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
    productCount,
    products: includeProducts ? products : undefined,
    _count: { products: productCount }
  };
};

export const listCategories = async (options: { includeProducts?: boolean } = {}) => {
  try {
    const categoriesRef = getCollection(COLLECTIONS.CATEGORIES);
    // Firestore doesn't support multiple orderBy without composite index
    // Fetch all and sort in memory instead
    const snapshot = await categoriesRef.get();

    const categories = snapshotToArray<FirestoreCategory>(snapshot);
    
    // Sort in memory: top selling first, then by name
    categories.sort((a, b) => {
      // First sort by isTopSelling (true first)
      if (a.isTopSelling !== b.isTopSelling) {
        return a.isTopSelling ? -1 : 1;
      }
      // Then sort by name
      return a.name.localeCompare(b.name);
    });
    
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
    const categoryIdString = String(id);
    
    // Get the category to find its products
    const categoryDoc = await getCollection(COLLECTIONS.CATEGORIES).doc(categoryIdString).get();
    if (!categoryDoc.exists) {
      throw new Error('Category not found');
    }
    
    const categoryData = categoryDoc.data() as FirestoreCategory;
    const productIds = categoryData?.productIds || [];
    
    // Get all products to check which ones belong ONLY to this category
    const productsSnapshot = await getCollection(COLLECTIONS.PRODUCTS).get();
    const { db } = await import('../../utils/firebaseAdmin');
    if (!db) throw new Error('Firestore not initialized');
    
    const batch = db.batch();
    const productsToDelete: any[] = [];
    const productsToUpdate: any[] = [];
    
    productsSnapshot.docs.forEach((doc) => {
      const productData = doc.data() as any;
      const productCategoryIds = (productData.categoryIds || []) as string[];
      
      // Check if product belongs to this category
      if (productCategoryIds.includes(categoryIdString)) {
        // Remove category from product's categoryIds
        const updatedCategoryIds = productCategoryIds.filter((catId: string) => catId !== categoryIdString);
        
        // If product belongs ONLY to this category (or has no other categories), delete it
        if (updatedCategoryIds.length === 0) {
          productsToDelete.push(doc.ref);
        } else {
          // Otherwise, just remove the category reference
          productsToUpdate.push({ ref: doc.ref, categoryIds: updatedCategoryIds });
        }
      }
    });
    
    // Delete products that belong only to this category
    productsToDelete.forEach((ref) => {
      batch.delete(ref);
    });
    
    // Update products to remove category reference
    productsToUpdate.forEach(({ ref, categoryIds }) => {
      batch.update(ref, { categoryIds });
    });
    
    // Delete the category itself
    batch.delete(getCollection(COLLECTIONS.CATEGORIES).doc(categoryIdString));
    
    await batch.commit();
    
    console.log(`Deleted category ${id} and ${productsToDelete.length} associated product(s)`);
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
};

export const setCategoryProducts = async (categoryId: number, productIds: number[]) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized. Please configure FIREBASE_SERVICE_ACCOUNT.');
    }

    const categoryRef = getCollection(COLLECTIONS.CATEGORIES).doc(String(categoryId));
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      throw new Error(`Category with id ${categoryId} not found`);
    }

    // Convert product IDs to strings (Firestore uses string IDs)
    // Filter out the category ID itself and ensure all IDs are valid
    const categoryIdString = String(categoryId);
    const productIdStrings = productIds
      .map((id) => String(id))
      .filter((idStr) => idStr.trim() !== '' && idStr !== categoryIdString);

    // Verify all product IDs exist before updating
    const productExistencePromises = productIdStrings.map(async (productId) => {
      const productDoc = await getCollection(COLLECTIONS.PRODUCTS).doc(productId).get();
      return { id: productId, exists: productDoc.exists };
    });
    
    const productExistenceResults = await Promise.all(productExistencePromises);
    const validProductIds = productExistenceResults
      .filter(({ exists }) => exists)
      .map(({ id }) => id);

    // Update category with valid product IDs only
    await categoryRef.update({
      productIds: validProductIds,
      updatedAt: new Date().toISOString()
    });

    // Also update products to include this category
    // Get products that should be in this category
    const productsToUpdate: Array<{ ref: any; categoryIds: string[] }> = [];
    
    // Get all products
    const allProductsSnapshot = await getCollection(COLLECTIONS.PRODUCTS).get();
    const categoryIdString = String(categoryId);
    
    // Find products that need updates
    allProductsSnapshot.docs.forEach((doc) => {
      const productData = doc.data() as any;
      const currentCategoryIds = (productData.categoryIds || []) as string[];
      const productDocId = doc.id; // Firestore document ID (should match product ID)
      
      // Check if this product should be in the category (use validProductIds, not productIdStrings)
      const shouldBeInCategory = validProductIds.includes(productDocId);
      const isInCategory = currentCategoryIds.includes(categoryIdString);
      
      if (shouldBeInCategory && !isInCategory) {
        // Add category to product
        productsToUpdate.push({
          ref: doc.ref,
          categoryIds: [...currentCategoryIds, categoryIdString]
        });
      } else if (!shouldBeInCategory && isInCategory) {
        // Remove category from product
        productsToUpdate.push({
          ref: doc.ref,
          categoryIds: currentCategoryIds.filter((id) => id !== categoryIdString)
        });
      }
    });
    
    // Batch update products (Firestore batch limit is 500)
    if (productsToUpdate.length > 0) {
      const batch = db.batch();
      productsToUpdate.forEach(({ ref, categoryIds }) => {
        batch.update(ref, { categoryIds });
      });
      await batch.commit();
    }

    return getCategoryById(categoryId, { includeProducts: true });
  } catch (error) {
    console.error('Error in setCategoryProducts:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
};

