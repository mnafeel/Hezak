"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeOrder = exports.serializeCategory = exports.serializeProduct = exports.serializeMoney = void 0;
const serializeMoney = (value) => Number(((value ?? 0) / 100).toFixed(2));
exports.serializeMoney = serializeMoney;
const serializeProduct = (product) => {
    // Safely extract categories from the nested structure
    let categories = [];
    try {
        if (product.categories && Array.isArray(product.categories)) {
            categories = product.categories
                .map((pc) => {
                try {
                    // Handle Prisma structure: { category: {...} }
                    if (pc && typeof pc === 'object' && 'category' in pc && pc.category) {
                        const cat = pc.category;
                        return {
                            id: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
                            name: cat.name,
                            slug: cat.slug
                        };
                    }
                    // Handle Firestore structure: { id, name, slug, categoryId, category: {...} }
                    if (pc && typeof pc === 'object' && 'category' in pc && pc.category && typeof pc.category === 'object') {
                        const cat = pc.category;
                        return {
                            id: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
                            name: cat.name,
                            slug: cat.slug
                        };
                    }
                    // Handle direct category object (Firestore fallback)
                    if (pc && typeof pc === 'object' && 'id' in pc && 'name' in pc && 'slug' in pc) {
                        const cat = pc;
                        return {
                            id: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
                            name: cat.name,
                            slug: cat.slug
                        };
                    }
                    return null;
                }
                catch (err) {
                    console.error('Error mapping category:', err, pc);
                    return null;
                }
            })
                .filter((cat) => cat !== null && cat.id > 0);
        }
    }
    catch (error) {
        console.error('Error extracting categories from product:', error, product.id);
        categories = [];
    }
    // For backward compatibility, use the first category as the primary category
    // Also handle if product.category is already an object (Firestore case)
    let primaryCategory = null;
    if (product.category && typeof product.category === 'object' && 'id' in product.category) {
        // Product already has a category object (Firestore case)
        const cat = product.category;
        primaryCategory = {
            id: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
            name: cat.name,
            slug: cat.slug
        };
    }
    else if (categories.length > 0) {
        // Use first category from categories array
        primaryCategory = categories[0];
    }
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: (0, exports.serializeMoney)(product.priceCents),
        imageUrl: product.imageUrl,
        gallery: (() => {
            try {
                if (Array.isArray(product.gallery)) {
                    return product.gallery.filter((item) => typeof item === 'string');
                }
                // Try to parse if it's a string
                if (typeof product.gallery === 'string') {
                    const parsed = JSON.parse(product.gallery);
                    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
                }
                return [];
            }
            catch {
                return [];
            }
        })(),
        colors: (() => {
            try {
                if (Array.isArray(product.colors)) {
                    return product.colors.map((color) => ({
                        name: typeof color.name === 'string' ? color.name : '',
                        hex: typeof color.hex === 'string' ? color.hex : undefined,
                        imageUrl: typeof color.imageUrl === 'string' ? color.imageUrl : undefined
                    }));
                }
                if (typeof product.colors === 'string' && product.colors.trim()) {
                    const parsed = JSON.parse(product.colors);
                    return Array.isArray(parsed) ? parsed.map((color) => ({
                        name: typeof color.name === 'string' ? color.name : '',
                        hex: typeof color.hex === 'string' ? color.hex : undefined,
                        imageUrl: typeof color.imageUrl === 'string' ? color.imageUrl : undefined
                    })) : [];
                }
                return [];
            }
            catch {
                return [];
            }
        })(),
        sizes: (() => {
            try {
                if (Array.isArray(product.sizes)) {
                    return product.sizes.map((size) => ({
                        name: typeof size.name === 'string' ? size.name : ''
                    }));
                }
                if (typeof product.sizes === 'string' && product.sizes.trim()) {
                    const parsed = JSON.parse(product.sizes);
                    return Array.isArray(parsed) ? parsed.map((size) => ({
                        name: typeof size.name === 'string' ? size.name : ''
                    })) : [];
                }
                return [];
            }
            catch {
                return [];
            }
        })(),
        itemType: typeof product.itemType === 'string' ? product.itemType : '',
        inventory: product.inventory,
        inventoryVariants: (() => {
            try {
                if (Array.isArray(product.inventoryVariants)) {
                    return product.inventoryVariants.map((variant) => ({
                        colorName: typeof variant.colorName === 'string' ? variant.colorName : '',
                        sizeName: typeof variant.sizeName === 'string' ? variant.sizeName : '',
                        quantity: typeof variant.quantity === 'number' ? variant.quantity : 0
                    }));
                }
                if (typeof product.inventoryVariants === 'string' && product.inventoryVariants.trim()) {
                    const parsed = JSON.parse(product.inventoryVariants);
                    return Array.isArray(parsed) ? parsed.map((variant) => ({
                        colorName: typeof variant.colorName === 'string' ? variant.colorName : '',
                        sizeName: typeof variant.sizeName === 'string' ? variant.sizeName : '',
                        quantity: typeof variant.quantity === 'number' ? variant.quantity : 0
                    })) : [];
                }
                return [];
            }
            catch {
                return [];
            }
        })(),
        isFeatured: product.isFeatured,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        category: primaryCategory,
        categories: (() => {
            // If categories already have the correct structure (from Firestore), use them
            if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
                // Check if it's already in the correct format (has categoryId and category)
                const firstItem = product.categories[0];
                if (firstItem && typeof firstItem === 'object' && ('categoryId' in firstItem || 'category' in firstItem)) {
                    return product.categories
                        .filter((pc) => pc && (pc.categoryId || pc.category))
                        .map((pc) => {
                        const catId = pc.categoryId || (pc.category?.id ? (typeof pc.category.id === 'string' ? parseInt(pc.category.id) : pc.category.id) : null);
                        const catObj = pc.category || categories.find(c => c.id === (typeof catId === 'string' ? parseInt(catId) : catId));
                        if (!catId || !catObj)
                            return null;
                        return {
                            id: pc.id || (typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id),
                            productId: typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id,
                            categoryId: typeof catId === 'string' ? parseInt(catId) : catId,
                            createdAt: pc.createdAt || product.createdAt || new Date().toISOString(),
                            category: catObj
                        };
                    })
                        .filter((pc) => pc !== null);
                }
                // Handle case where categories array contains just IDs (numbers or strings)
                // In this case, we need to use the extracted categories array (which should have category objects)
                if (firstItem && (typeof firstItem === 'number' || typeof firstItem === 'string')) {
                    // If categories array contains just IDs, we should have already extracted category objects above
                    // But if we're here, it means the categories weren't properly extracted
                    // So we'll build from the extracted categories array (which should have objects)
                    if (categories.length > 0) {
                        return categories.map((cat) => ({
                            id: typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id,
                            productId: typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id,
                            categoryId: typeof cat.id === 'string' ? parseInt(cat.id) || 0 : cat.id,
                            createdAt: product.createdAt || new Date().toISOString(),
                            category: cat
                        }));
                    }
                    // If no categories extracted, return empty array
                    return [];
                }
            }
            // Otherwise, build from categories array
            return categories.map((cat) => ({
                id: typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id,
                productId: typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id,
                categoryId: cat.id,
                createdAt: product.createdAt || new Date().toISOString(),
                category: cat
            }));
        })()
    };
};
exports.serializeProduct = serializeProduct;
const serializeCategory = (category) => {
    // Extract products from ProductCategory join table
    let products = undefined;
    if (category.products && Array.isArray(category.products)) {
        // Products come through ProductCategory, so we need to extract the product from each
        products = category.products
            .map((pc) => {
            // Check if it's the new structure (with product nested) or old structure (direct product)
            if (pc && typeof pc === 'object' && 'product' in pc && pc.product) {
                const product = pc.product;
                return {
                    id: product.id,
                    name: product.name,
                    itemType: product.itemType ?? ''
                };
            }
            // Fallback for direct product structure (shouldn't happen with new schema, but just in case)
            if (pc && typeof pc === 'object' && 'id' in pc && 'name' in pc) {
                const prod = pc;
                return {
                    id: prod.id,
                    name: prod.name,
                    itemType: prod.itemType ?? ''
                };
            }
            return null;
        })
            .filter((p) => p !== null);
        // Remove duplicates by id
        const seen = new Set();
        products = products.filter((p) => {
            if (seen.has(p.id)) {
                return false;
            }
            seen.add(p.id);
            return true;
        });
    }
    return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isTopSelling: category.isTopSelling ?? false,
        isFeatured: category.isFeatured ?? false,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: category._count?.products ??
            (products ? products.length : 0),
        products
    };
};
exports.serializeCategory = serializeCategory;
const serializeOrder = (order) => ({
    id: order.id,
    status: order.status,
    total: (0, exports.serializeMoney)(order.totalCents),
    trackingId: order.trackingId ?? null,
    courierCompany: order.courierCompany ?? null,
    trackingLink: order.trackingLink ?? null,
    orderSource: order.orderSource ?? 'WEBSITE',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
        addressLine1: order.user.addressLine1,
        addressLine2: order.user.addressLine2,
        city: order.user.city,
        state: order.user.state,
        postalCode: order.user.postalCode,
        country: order.user.country
    },
    items: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: (0, exports.serializeMoney)(item.unitPriceCents),
        selectedColor: item.selectedColor
            ? {
                name: item.selectedColor,
                hex: item.selectedColorHex ?? undefined,
                imageUrl: item.selectedColorImage ?? undefined
            }
            : null,
        selectedSize: item.selectedSize ?? null,
        product: {
            id: item.product.id,
            name: item.product.name,
            imageUrl: item.product.imageUrl
        }
    }))
});
exports.serializeOrder = serializeOrder;
//# sourceMappingURL=serializers.js.map