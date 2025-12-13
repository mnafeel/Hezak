"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.listProducts = void 0;
const firestore_1 = require("../../utils/firestore");
// Convert Firestore product to API format
const toProduct = async (firestoreProduct) => {
    const categories = [];
    if (firestoreProduct.categoryIds && firestoreProduct.categoryIds.length > 0) {
        const categoryPromises = firestoreProduct.categoryIds.map(async (categoryId) => {
            const categoryDoc = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES).doc(categoryId).get();
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
        categories.push(...categoryResults.filter((c) => c !== null));
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
        createdAt: (0, firestore_1.toDate)(firestoreProduct.createdAt),
        updatedAt: (0, firestore_1.toDate)(firestoreProduct.updatedAt),
        category: categories[0] || null,
        categories: categories.map((cat) => ({
            id: parseInt(cat.id) || cat.id,
            productId: parseInt(firestoreProduct.id) || firestoreProduct.id,
            categoryId: parseInt(cat.id) || cat.id,
            createdAt: (0, firestore_1.toDate)(firestoreProduct.createdAt),
            category: cat
        }))
    };
};
const listProducts = async (categorySlug) => {
    try {
        const productsRef = (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.PRODUCTS);
        let productIds = undefined;
        if (categorySlug) {
            // Find category by slug
            const categoriesSnapshot = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES)
                .where('slug', '==', categorySlug)
                .limit(1)
                .get();
            if (categoriesSnapshot.empty) {
                return [];
            }
            const categoryId = categoriesSnapshot.docs[0].id;
            // Get all products with this category
            // Check both string and number formats for categoryId
            const allProductsSnapshot = await productsRef.get();
            productIds = allProductsSnapshot.docs
                .filter((doc) => {
                const data = doc.data();
                if (!data.categoryIds || !Array.isArray(data.categoryIds)) {
                    return false;
                }
                // Check if categoryId (string) matches any categoryId in the array (could be string or number)
                return data.categoryIds.some((id) => {
                    const idStr = String(id);
                    const catIdStr = String(categoryId);
                    return idStr === catIdStr;
                });
            })
                .map((doc) => doc.id);
        }
        // Get all products and filter in memory (Firestore doesn't support __name__ in where clauses)
        const allProductsSnapshot = await productsRef.get();
        let products = [];
        if (productIds && productIds.length > 0) {
            // Filter products that match the category
            const productIdSet = new Set(productIds);
            products = allProductsSnapshot.docs
                .filter((doc) => productIdSet.has(doc.id))
                .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                };
            });
        }
        else {
            // Get all products without category filter
            products = (0, firestore_1.snapshotToArray)(allProductsSnapshot);
        }
        // Sort by createdAt desc in memory (since we can't use orderBy without index)
        products.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Descending
        });
        return Promise.all(products.map(toProduct));
    }
    catch (error) {
        console.error('Error in listProducts:', error);
        throw error;
    }
};
exports.listProducts = listProducts;
const getProductById = async (id) => {
    try {
        const productDoc = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.PRODUCTS).doc(String(id)).get();
        if (!productDoc.exists) {
            return null;
        }
        const product = (0, firestore_1.docToObject)(productDoc);
        if (!product)
            return null;
        return toProduct(product);
    }
    catch (error) {
        console.error('Error in getProductById:', error);
        throw error;
    }
};
exports.getProductById = getProductById;
const createProduct = async (input) => {
    try {
        // Validate category IDs if provided
        if (input.categoryIds && Array.isArray(input.categoryIds) && input.categoryIds.length > 0) {
            const validCategoryIds = input.categoryIds.filter((id) => typeof id === 'number' && id > 0);
            if (validCategoryIds.length > 0) {
                const categoryPromises = validCategoryIds.map(async (id) => {
                    const categoryDoc = await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.CATEGORIES).doc(String(id)).get();
                    return categoryDoc.exists ? String(id) : null;
                });
                const existingIds = (await Promise.all(categoryPromises)).filter((id) => id !== null);
                const invalidIds = validCategoryIds.filter((id) => !existingIds.includes(String(id)));
                if (invalidIds.length > 0) {
                    throw new Error(`Invalid category IDs: ${invalidIds.join(', ')}`);
                }
            }
        }
        const productId = Date.now().toString();
        const now = new Date().toISOString();
        // Filter out undefined values from colors (Firestore doesn't accept undefined)
        const sanitizedColors = (input.colors ?? []).map((color) => {
            const sanitized = { name: color.name };
            if (color.hex !== undefined && color.hex !== null && color.hex !== '') {
                sanitized.hex = color.hex;
            }
            if (color.imageUrl !== undefined && color.imageUrl !== null && color.imageUrl !== '') {
                sanitized.imageUrl = color.imageUrl;
            }
            return sanitized;
        });
        const productData = {
            name: input.name,
            description: input.description,
            priceCents: Math.round(input.price * 100),
            imageUrl: input.imageUrl,
            gallery: (input.gallery ?? []).filter((url) => url !== undefined && url !== null && url !== ''),
            colors: sanitizedColors,
            sizes: (input.sizes ?? []).filter((size) => size !== undefined && size !== null && size.name !== undefined),
            itemType: input.itemType ?? '',
            inventory: input.inventory,
            inventoryVariants: (input.inventoryVariants ?? []).filter((variant) => variant !== undefined &&
                variant !== null &&
                variant.colorName !== undefined &&
                variant.sizeName !== undefined),
            isFeatured: input.isFeatured ?? false,
            categoryIds: input.categoryIds?.map((id) => String(id)).filter((id) => id !== undefined && id !== null) || [],
            createdAt: now,
            updatedAt: now
        };
        await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.PRODUCTS).doc(productId).set(productData);
        return (0, exports.getProductById)(productId);
    }
    catch (error) {
        console.error('Error in createProduct:', error);
        throw error;
    }
};
exports.createProduct = createProduct;
const updateProduct = async (id, input) => {
    try {
        const productRef = (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.PRODUCTS).doc(String(id));
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            throw new Error('Product not found');
        }
        const updateData = {
            updatedAt: new Date().toISOString()
        };
        if (input.name !== undefined)
            updateData.name = input.name;
        if (input.description !== undefined)
            updateData.description = input.description;
        if (input.imageUrl !== undefined)
            updateData.imageUrl = input.imageUrl;
        if (input.gallery !== undefined) {
            updateData.gallery = input.gallery.filter((url) => url !== undefined && url !== null && url !== '');
        }
        if (input.colors !== undefined) {
            // Filter out undefined values from colors (Firestore doesn't accept undefined)
            updateData.colors = input.colors.map((color) => {
                const sanitized = { name: color.name };
                if (color.hex !== undefined && color.hex !== null && color.hex !== '') {
                    sanitized.hex = color.hex;
                }
                if (color.imageUrl !== undefined && color.imageUrl !== null && color.imageUrl !== '') {
                    sanitized.imageUrl = color.imageUrl;
                }
                return sanitized;
            });
        }
        if (input.sizes !== undefined) {
            updateData.sizes = input.sizes.filter((size) => size !== undefined && size !== null && size.name !== undefined);
        }
        if (input.itemType !== undefined)
            updateData.itemType = input.itemType;
        if (input.inventory !== undefined)
            updateData.inventory = input.inventory;
        if (input.inventoryVariants !== undefined) {
            updateData.inventoryVariants = input.inventoryVariants.filter((variant) => variant !== undefined &&
                variant !== null &&
                variant.colorName !== undefined &&
                variant.sizeName !== undefined);
        }
        if (input.price !== undefined)
            updateData.priceCents = Math.round(input.price * 100);
        if (input.isFeatured !== undefined)
            updateData.isFeatured = input.isFeatured;
        // Update category IDs if provided
        if (input.categoryIds !== undefined) {
            updateData.categoryIds = input.categoryIds.map((id) => String(id)).filter((id) => id !== undefined && id !== null);
        }
        await productRef.update(updateData);
        return (0, exports.getProductById)(id);
    }
    catch (error) {
        console.error('Error in updateProduct:', error);
        throw error;
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    try {
        await (0, firestore_1.getCollection)(firestore_1.COLLECTIONS.PRODUCTS).doc(String(id)).delete();
    }
    catch (error) {
        console.error('Error in deleteProduct:', error);
        throw error;
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productService.js.map