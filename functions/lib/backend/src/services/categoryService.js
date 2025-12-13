"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCategoryProducts = exports.getCategoryById = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.listCategories = void 0;
const prisma_1 = require("../utils/prisma");
const listCategories = async (options = {}) => {
    try {
        // Start with simplest query possible
        const categories = await prisma_1.prisma.category.findMany({
            orderBy: [
                { isTopSelling: 'desc' },
                { name: 'asc' }
            ]
        });
        // If products are requested, fetch them separately
        let categoriesWithProducts = categories;
        if (options.includeProducts) {
            categoriesWithProducts = await Promise.all(categories.map(async (cat) => {
                const productCategories = await prisma_1.prisma.productCategory.findMany({
                    where: { categoryId: cat.id },
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                itemType: true
                            }
                        }
                    }
                });
                return {
                    ...cat,
                    products: productCategories.map((pc) => pc.product)
                };
            }));
        }
        // Count products for each category
        const categoriesWithCount = await Promise.all(categoriesWithProducts.map(async (cat) => {
            const productCount = await prisma_1.prisma.productCategory.count({
                where: { categoryId: cat.id }
            });
            return {
                ...cat,
                _count: { products: productCount },
                products: 'products' in cat ? cat.products : undefined
            };
        }));
        return categoriesWithCount;
    }
    catch (error) {
        console.error('Error in listCategories:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        throw error;
    }
};
exports.listCategories = listCategories;
const createCategory = async (input) => {
    try {
        return await prisma_1.prisma.$transaction(async (tx) => {
            // If setting as top selling, unset any existing top selling category
            if (input.isTopSelling) {
                await tx.category.updateMany({
                    where: { isTopSelling: true },
                    data: { isTopSelling: false }
                });
            }
            // If setting as featured, unset any existing featured category
            if (input.isFeatured) {
                await tx.category.updateMany({
                    where: { isFeatured: true },
                    data: { isFeatured: false }
                });
            }
            return tx.category.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    description: input.description || null,
                    isTopSelling: input.isTopSelling ?? false,
                    isFeatured: input.isFeatured ?? false
                }
            });
        });
    }
    catch (error) {
        console.error('Error in createCategory:', error);
        throw error;
    }
};
exports.createCategory = createCategory;
const updateCategory = async (id, input) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        // If setting as top selling, unset any existing top selling category (except current one)
        if (input.isTopSelling === true) {
            await tx.category.updateMany({
                where: {
                    isTopSelling: true,
                    id: { not: id }
                },
                data: { isTopSelling: false }
            });
        }
        // If setting as featured, unset any existing featured category (except current one)
        if (input.isFeatured === true) {
            await tx.category.updateMany({
                where: {
                    isFeatured: true,
                    id: { not: id }
                },
                data: { isFeatured: false }
            });
        }
        const updateData = {
            description: input.description === '' ? null : input.description
        };
        // Explicitly handle each field to ensure proper updates
        if (input.name !== undefined) {
            updateData.name = input.name;
        }
        if (input.slug !== undefined) {
            updateData.slug = input.slug;
        }
        if (input.isTopSelling !== undefined) {
            updateData.isTopSelling = input.isTopSelling;
        }
        if (input.isFeatured !== undefined) {
            updateData.isFeatured = input.isFeatured;
        }
        return tx.category.update({
            where: { id },
            data: updateData
        });
    });
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    await prisma_1.prisma.category.delete({
        where: { id }
    });
};
exports.deleteCategory = deleteCategory;
const getCategoryById = async (id, options = {}) => {
    try {
        const include = {};
        if (options.includeProducts) {
            include.products = {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            itemType: true
                        }
                    }
                }
            };
        }
        const category = await prisma_1.prisma.category.findUnique({
            where: { id },
            include
        });
        if (!category) {
            return null;
        }
        // Manually count products
        const productCount = await prisma_1.prisma.productCategory.count({
            where: { categoryId: id }
        });
        return {
            ...category,
            _count: { products: productCount }
        };
    }
    catch (error) {
        console.error('Error in getCategoryById:', error);
        throw error;
    }
};
exports.getCategoryById = getCategoryById;
const setCategoryProducts = async (categoryId, productIds) => {
    try {
        // Ensure productIds is an array
        const validProductIds = Array.isArray(productIds) ? productIds.filter((id) => typeof id === 'number' && id > 0) : [];
        return prisma_1.prisma.$transaction(async (tx) => {
            // Verify category exists
            const categoryExists = await tx.category.findUnique({
                where: { id: categoryId }
            });
            if (!categoryExists) {
                throw new Error(`Category with id ${categoryId} not found`);
            }
            // Get all products currently in this category through the join table
            let currentProductCategories;
            try {
                currentProductCategories = await tx.productCategory.findMany({
                    where: { categoryId },
                    select: { productId: true }
                });
            }
            catch (error) {
                console.error('Error fetching current product categories:', error);
                console.error('Transaction client keys:', Object.keys(tx));
                throw new Error(`Failed to fetch current products: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            const currentProductIds = currentProductCategories.map((pc) => pc.productId);
            // Find products to remove (in category but not in new list)
            const productsToRemove = currentProductIds.filter((id) => !validProductIds.includes(id));
            // Find products to add (in new list but not in category)
            const productsToAdd = validProductIds.filter((id) => !currentProductIds.includes(id));
            // Remove products from category
            if (productsToRemove.length > 0) {
                await tx.productCategory.deleteMany({
                    where: {
                        categoryId,
                        productId: { in: productsToRemove }
                    }
                }).catch((error) => {
                    console.error('Error removing products from category:', error);
                    throw new Error(`Failed to remove products: ${error instanceof Error ? error.message : 'Unknown error'}`);
                });
            }
            // Add products to category
            if (productsToAdd.length > 0) {
                // Verify all product IDs exist before adding
                const existingProducts = await tx.product.findMany({
                    where: { id: { in: productsToAdd } },
                    select: { id: true }
                });
                const existingProductIds = existingProducts.map((p) => p.id);
                const invalidProductIds = productsToAdd.filter((id) => !existingProductIds.includes(id));
                if (invalidProductIds.length > 0) {
                    throw new Error(`Invalid product IDs: ${invalidProductIds.join(', ')}`);
                }
                await tx.productCategory.createMany({
                    data: productsToAdd.map((productId) => ({
                        productId,
                        categoryId
                    }))
                }).catch((error) => {
                    console.error('Error adding products to category:', error);
                    throw new Error(`Failed to add products: ${error instanceof Error ? error.message : 'Unknown error'}`);
                });
            }
            const category = await tx.category.findUniqueOrThrow({
                where: { id: categoryId },
                include: {
                    products: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    itemType: true
                                }
                            }
                        }
                    }
                }
            });
            // Manually count products
            const productCount = await tx.productCategory.count({
                where: { categoryId }
            });
            return {
                ...category,
                _count: { products: productCount }
            };
        });
    }
    catch (error) {
        console.error('Error in setCategoryProducts:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        throw error;
    }
};
exports.setCategoryProducts = setCategoryProducts;
//# sourceMappingURL=categoryService.js.map