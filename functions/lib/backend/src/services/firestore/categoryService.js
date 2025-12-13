"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCategoryProducts = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.listCategories = void 0;
const firestore_1 = require("../../utils/firestore");
const firebaseAdmin_1 = require("../../utils/firebaseAdmin");
// Convert Firestore category to API format
const toCategory = async (firestoreCategory, includeProducts = false) => {
    let products = [];
    let productCount = 0;
    if (includeProducts && firestoreCategory.productIds && firestoreCategory.productIds.length > 0) {
        const productPromises = firestoreCategory.productIds.map(async (productId) => {
            const productDoc = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.PRODUCTS).doc(productId).get();
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
        products = productResults.filter((p) => p !== null);
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
        createdAt: (0, firestore_1.toDate)(firestoreCategory.createdAt),
        updatedAt: (0, firestore_1.toDate)(firestoreCategory.updatedAt),
        productCount: includeProducts ? products.length : productCount,
        products: includeProducts ? products : undefined,
        _count: { products: includeProducts ? products.length : productCount }
    };
};
const listCategories = async (options = {}) => {
    try {
        const categoriesRef = (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES);
        // Firestore doesn't support multiple orderBy without composite index
        // Fetch all and sort in memory instead
        const snapshot = await categoriesRef.get();
        const categories = (0, firestore_1.snapshotToArray)(snapshot);
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
    }
    catch (error) {
        console.error('Error in listCategories:', error);
        throw error;
    }
};
exports.listCategories = listCategories;
const getCategoryById = async (id, options = {}) => {
    try {
        const categoryDoc = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES).doc(String(id)).get();
        if (!categoryDoc.exists) {
            return null;
        }
        const category = (0, firestore_1.docToObject)(categoryDoc);
        if (!category)
            return null;
        return toCategory(category, options.includeProducts);
    }
    catch (error) {
        console.error('Error in getCategoryById:', error);
        throw error;
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (input) => {
    try {
        // If setting as top selling, unset any existing top selling category
        if (input.isTopSelling) {
            const topSellingSnapshot = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES)
                .where('isTopSelling', '==', true)
                .get();
            if (!firebaseAdmin_1.db)
                throw new Error('Firestore not initialized');
            const batch = firebaseAdmin_1.db.batch();
            topSellingSnapshot.docs.forEach((doc) => {
                batch.update(doc.ref, { isTopSelling: false });
            });
            await batch.commit();
        }
        // If setting as featured, unset any existing featured category
        if (input.isFeatured) {
            const featuredSnapshot = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES)
                .where('isFeatured', '==', true)
                .get();
            if (!firebaseAdmin_1.db)
                throw new Error('Firestore not initialized');
            const batch = firebaseAdmin_1.db.batch();
            featuredSnapshot.docs.forEach((doc) => {
                batch.update(doc.ref, { isFeatured: false });
            });
            await batch.commit();
        }
        const categoryId = Date.now().toString();
        const now = new Date().toISOString();
        const categoryData = {
            name: input.name,
            slug: input.slug,
            description: input.description || null,
            isTopSelling: input.isTopSelling ?? false,
            isFeatured: input.isFeatured ?? false,
            productIds: [],
            createdAt: now,
            updatedAt: now
        };
        await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES).doc(categoryId).set(categoryData);
        return (0, exports.getCategoryById)(categoryId);
    }
    catch (error) {
        console.error('Error in createCategory:', error);
        throw error;
    }
};
exports.createCategory = createCategory;
const updateCategory = async (id, input) => {
    try {
        const categoryRef = (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES).doc(String(id));
        const categoryDoc = await categoryRef.get();
        if (!categoryDoc.exists) {
            throw new Error('Category not found');
        }
        // If setting as top selling, unset any existing top selling category (except current one)
        if (input.isTopSelling === true) {
            const topSellingSnapshot = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES)
                .where('isTopSelling', '==', true)
                .get();
            if (!firebaseAdmin_1.db)
                throw new Error('Firestore not initialized');
            const batch = firebaseAdmin_1.db.batch();
            topSellingSnapshot.docs.forEach((doc) => {
                if (doc.id !== String(id)) {
                    batch.update(doc.ref, { isTopSelling: false });
                }
            });
            await batch.commit();
        }
        // If setting as featured, unset any existing featured category (except current one)
        if (input.isFeatured === true) {
            const featuredSnapshot = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES)
                .where('isFeatured', '==', true)
                .get();
            if (!firebaseAdmin_1.db)
                throw new Error('Firestore not initialized');
            const batch = firebaseAdmin_1.db.batch();
            featuredSnapshot.docs.forEach((doc) => {
                if (doc.id !== String(id)) {
                    batch.update(doc.ref, { isFeatured: false });
                }
            });
            await batch.commit();
        }
        const updateData = {
            updatedAt: new Date().toISOString()
        };
        if (input.name !== undefined)
            updateData.name = input.name;
        if (input.slug !== undefined)
            updateData.slug = input.slug;
        if (input.description !== undefined)
            updateData.description = input.description === '' ? null : input.description;
        if (input.isTopSelling !== undefined)
            updateData.isTopSelling = input.isTopSelling;
        if (input.isFeatured !== undefined)
            updateData.isFeatured = input.isFeatured;
        await categoryRef.update(updateData);
        return (0, exports.getCategoryById)(id);
    }
    catch (error) {
        console.error('Error in updateCategory:', error);
        throw error;
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    try {
        await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES).doc(String(id)).delete();
        // Also remove category from all products
        const productsSnapshot = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.PRODUCTS).get();
        const { db } = await Promise.resolve().then(() => __importStar(require('../../utils/firebaseAdmin')));
        if (!db)
            throw new Error('Firestore not initialized');
        const batch = db.batch();
        productsSnapshot.docs.forEach((doc) => {
            const productData = doc.data();
            if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
                const updatedCategoryIds = productData.categoryIds.filter((catId) => catId !== String(id));
                if (updatedCategoryIds.length !== productData.categoryIds.length) {
                    batch.update(doc.ref, { categoryIds: updatedCategoryIds });
                }
            }
        });
        await batch.commit();
    }
    catch (error) {
        console.error('Error in deleteCategory:', error);
        throw error;
    }
};
exports.deleteCategory = deleteCategory;
const setCategoryProducts = async (categoryId, productIds) => {
    try {
        if (!firebaseAdmin_1.db) {
            throw new Error('Firestore not initialized. Please configure FIREBASE_SERVICE_ACCOUNT.');
        }
        const categoryRef = (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES).doc(String(categoryId));
        const categoryDoc = await categoryRef.get();
        if (!categoryDoc.exists) {
            throw new Error(`Category with id ${categoryId} not found`);
        }
        // Convert product IDs to strings (Firestore uses string IDs)
        const productIdStrings = productIds.map((id) => String(id));
        // Update category with product IDs
        await categoryRef.update({
            productIds: productIdStrings,
            updatedAt: new Date().toISOString()
        });
        // Also update products to include this category
        // Get products that should be in this category
        const productsToUpdate = [];
        // Get all products
        const allProductsSnapshot = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.PRODUCTS).get();
        const categoryIdString = String(categoryId);
        // Find products that need updates
        allProductsSnapshot.docs.forEach((doc) => {
            const productData = doc.data();
            const currentCategoryIds = (productData.categoryIds || []);
            const productDocId = doc.id; // Firestore document ID (should match product ID)
            // Check if this product should be in the category
            const shouldBeInCategory = productIdStrings.includes(productDocId);
            const isInCategory = currentCategoryIds.includes(categoryIdString);
            if (shouldBeInCategory && !isInCategory) {
                // Add category to product
                productsToUpdate.push({
                    ref: doc.ref,
                    categoryIds: [...currentCategoryIds, categoryIdString]
                });
            }
            else if (!shouldBeInCategory && isInCategory) {
                // Remove category from product
                productsToUpdate.push({
                    ref: doc.ref,
                    categoryIds: currentCategoryIds.filter((id) => id !== categoryIdString)
                });
            }
        });
        // Batch update products (Firestore batch limit is 500)
        if (productsToUpdate.length > 0) {
            const batch = firebaseAdmin_1.db.batch();
            productsToUpdate.forEach(({ ref, categoryIds }) => {
                batch.update(ref, { categoryIds });
            });
            await batch.commit();
        }
        return (0, exports.getCategoryById)(categoryId, { includeProducts: true });
    }
    catch (error) {
        console.error('Error in setCategoryProducts:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        throw error;
    }
};
exports.setCategoryProducts = setCategoryProducts;
//# sourceMappingURL=categoryService.js.map