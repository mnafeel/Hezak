import { getCollection, COLLECTIONS, snapshotToArray, docToObject, toDate, toTimestamp } from '../../utils/firestore';
import { ProductInput, UpdateProductInput } from '../../schemas/product';
import type { Product, Category } from '../../types';

// Firestore Product type (with string IDs)
export interface FirestoreProduct {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  gallery: any[];
  colors: any[];
  sizes: any[];
  itemType: string;
  inventory: number;
  inventoryVariants: any[];
  isFeatured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  categoryIds?: string[]; // Store category IDs directly
}

// Convert Firestore product to API format
const toProduct = async (firestoreProduct: FirestoreProduct): Promise<any> => {
  const categories = [];
  
  if (firestoreProduct.categoryIds && firestoreProduct.categoryIds.length > 0) {
    const categoryPromises = firestoreProduct.categoryIds.map(async (categoryId) => {
      const categoryDoc = await getCollection(COLLECTIONS.CATEGORIES).doc(categoryId).get();
      if (categoryDoc.exists) {
        const categoryData = categoryDoc.data();
        return {
          id: categoryDoc.id,
          ...categoryData
        };
      }
      return null;
    });
    
    const categoryResults = await Promise.all(categoryPromises);
    categories.push(...categoryResults.filter((c): c is any => c !== null));
  }

  return {
    id: parseInt(firestoreProduct.id) || firestoreProduct.id,
    name: firestoreProduct.name,
    description: firestoreProduct.description,
    price: firestoreProduct.priceCents / 100,
    priceCents: firestoreProduct.priceCents,
    imageUrl: firestoreProduct.imageUrl,
    gallery: firestoreProduct.gallery || [],
    colors: firestoreProduct.colors || [],
    sizes: firestoreProduct.sizes || [],
    itemType: firestoreProduct.itemType || '',
    inventory: firestoreProduct.inventory || 0,
    inventoryVariants: firestoreProduct.inventoryVariants || [],
    isFeatured: firestoreProduct.isFeatured || false,
    createdAt: toDate(firestoreProduct.createdAt),
    updatedAt: toDate(firestoreProduct.updatedAt),
    category: categories[0] || null,
    categories: categories.map((cat) => ({
      id: parseInt(cat.id) || cat.id,
      productId: parseInt(firestoreProduct.id) || firestoreProduct.id,
      categoryId: parseInt(cat.id) || cat.id,
      createdAt: toDate(firestoreProduct.createdAt),
      category: cat
    }))
  };
};

export const listProducts = async (categorySlug?: string) => {
  try {
    const productsRef = getCollection(COLLECTIONS.PRODUCTS);
    let query: FirebaseFirestore.Query = productsRef.orderBy('createdAt', 'desc');

    let productIds: string[] | undefined = undefined;

    if (categorySlug) {
      // Find category by slug
      const categoriesSnapshot = await getCollection(COLLECTIONS.CATEGORIES)
        .where('slug', '==', categorySlug)
        .limit(1)
        .get();

      if (categoriesSnapshot.empty) {
        return [];
      }

      const categoryId = categoriesSnapshot.docs[0].id;

      // Get all products with this category
      const allProductsSnapshot = await productsRef.get();
      productIds = allProductsSnapshot.docs
        .filter((doc) => {
          const data = doc.data() as FirestoreProduct;
          return data.categoryIds?.includes(categoryId);
        })
        .map((doc) => doc.id);
    }

    // Firestore 'in' queries are limited to 10 items
    let snapshot;
    if (productIds && productIds.length > 0) {
      // If we have category filter, get products in batches
      const batches = [];
      for (let i = 0; i < productIds.length; i += 10) {
        const batch = productIds.slice(i, i + 10);
        batches.push(productsRef.where('__name__', 'in', batch).get());
      }
      const results = await Promise.all(batches);
      // Combine results
      const allDocs: any[] = [];
      results.forEach((result) => {
        allDocs.push(...result.docs);
      });
      snapshot = { docs: allDocs };
    } else {
      snapshot = await query.get();
    }

    const products = snapshotToArray<FirestoreProduct>(snapshot);
    return Promise.all(products.map(toProduct));
  } catch (error) {
    console.error('Error in listProducts:', error);
    throw error;
  }
};

export const getProductById = async (id: number | string) => {
  try {
    const productDoc = await getCollection(COLLECTIONS.PRODUCTS).doc(String(id)).get();
    if (!productDoc.exists) {
      return null;
    }

    const product = docToObject<FirestoreProduct>(productDoc);
    if (!product) return null;

    return toProduct(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
};

export const createProduct = async (input: ProductInput) => {
  try {
    // Validate category IDs if provided
    if (input.categoryIds && Array.isArray(input.categoryIds) && input.categoryIds.length > 0) {
      const validCategoryIds = input.categoryIds.filter((id): id is number => typeof id === 'number' && id > 0);
      
      if (validCategoryIds.length > 0) {
        const categoryPromises = validCategoryIds.map(async (id) => {
          const categoryDoc = await getCollection(COLLECTIONS.CATEGORIES).doc(String(id)).get();
          return categoryDoc.exists ? String(id) : null;
        });
        
        const existingIds = (await Promise.all(categoryPromises)).filter((id): id is string => id !== null);
        const invalidIds = validCategoryIds.filter((id) => !existingIds.includes(String(id)));
        
        if (invalidIds.length > 0) {
          throw new Error(`Invalid category IDs: ${invalidIds.join(', ')}`);
        }
      }
    }

    const productId = Date.now().toString();
    const now = new Date().toISOString();

    const productData: Omit<FirestoreProduct, 'id'> = {
      name: input.name,
      description: input.description,
      priceCents: Math.round(input.price * 100),
      imageUrl: input.imageUrl,
      gallery: input.gallery ?? [],
      colors: input.colors ?? [],
      sizes: input.sizes ?? [],
      itemType: input.itemType ?? '',
      inventory: input.inventory,
      inventoryVariants: input.inventoryVariants ?? [],
      isFeatured: input.isFeatured ?? false,
      categoryIds: input.categoryIds?.map((id) => String(id)) || [],
      createdAt: now,
      updatedAt: now
    };

    await getCollection(COLLECTIONS.PRODUCTS).doc(productId).set(productData);

    return getProductById(productId);
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

export const updateProduct = async (id: number, input: UpdateProductInput) => {
  try {
    const productRef = getCollection(COLLECTIONS.PRODUCTS).doc(String(id));
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new Error('Product not found');
    }

    const updateData: Partial<FirestoreProduct> = {
      updatedAt: new Date().toISOString()
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.gallery !== undefined) updateData.gallery = input.gallery;
    if (input.colors !== undefined) updateData.colors = input.colors;
    if (input.sizes !== undefined) updateData.sizes = input.sizes;
    if (input.itemType !== undefined) updateData.itemType = input.itemType;
    if (input.inventory !== undefined) updateData.inventory = input.inventory;
    if (input.inventoryVariants !== undefined) updateData.inventoryVariants = input.inventoryVariants;
    if (input.price !== undefined) updateData.priceCents = Math.round(input.price * 100);
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;

    // Update category IDs if provided
    if (input.categoryIds !== undefined) {
      updateData.categoryIds = input.categoryIds.map((id) => String(id));
    }

    await productRef.update(updateData);

    return getProductById(id);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  try {
    await getCollection(COLLECTIONS.PRODUCTS).doc(String(id)).delete();
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};

