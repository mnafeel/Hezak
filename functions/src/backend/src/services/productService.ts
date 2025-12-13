// @ts-nocheck
import { prisma } from '../utils/prisma';
import { ProductInput, UpdateProductInput } from '../schemas/product';

export const listProducts = async (categorySlug?: string) => {
  try {
    let productIds: number[] | undefined = undefined;

    if (categorySlug) {
      // Find category by slug first
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true }
      });

      if (category) {
        // Get product IDs from ProductCategory join table
        const productCategories = await prisma.productCategory.findMany({
          where: { categoryId: category.id },
          select: { productId: true }
        });
        productIds = productCategories.map((pc) => pc.productId);
      } else {
        // Category doesn't exist, return empty
        return [];
      }
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where: productIds ? { id: { in: productIds.length > 0 ? productIds : [0] } } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch categories for each product separately to avoid complex joins
    const productsWithCategories = await Promise.all(
      products.map(async (product) => {
        const productCategories = await prisma.productCategory.findMany({
          where: { productId: product.id },
          include: {
            category: true
          }
        });
        return {
          ...product,
          categories: productCategories.map((pc) => ({
            id: pc.id,
            productId: pc.productId,
            categoryId: pc.categoryId,
            createdAt: pc.createdAt,
            category: pc.category
          }))
        };
      })
    );

    return productsWithCategories;
  } catch (error) {
    console.error('Error in listProducts:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
};

export const getProductById = async (id: number) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return null;
    }

    // Fetch categories separately
    const productCategories = await prisma.productCategory.findMany({
      where: { productId: id },
      include: {
        category: true
      }
    });

    return {
      ...product,
      categories: productCategories.map((pc) => ({
        id: pc.id,
        productId: pc.productId,
        categoryId: pc.categoryId,
        createdAt: pc.createdAt,
        category: pc.category
      }))
    };
  } catch (error) {
    console.error('Error in getProductById:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
};

export const createProduct = async (input: ProductInput) => {
  try {
    // Validate category IDs exist if provided
    if (input.categoryIds && Array.isArray(input.categoryIds) && input.categoryIds.length > 0) {
      const validCategoryIds = input.categoryIds.filter((id): id is number => typeof id === 'number' && id > 0);
      
      if (validCategoryIds.length > 0) {
        const existingCategories = await prisma.category.findMany({
          where: { id: { in: validCategoryIds } },
          select: { id: true }
        });
        
        const existingIds = existingCategories.map((c) => c.id);
        const invalidIds = validCategoryIds.filter((id) => !existingIds.includes(id));
        
        if (invalidIds.length > 0) {
          throw new Error(`Invalid category IDs: ${invalidIds.join(', ')}`);
        }
      }
    }

    return await prisma.product.create({
      data: {
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
        categories: input.categoryIds && Array.isArray(input.categoryIds) && input.categoryIds.length > 0
          ? {
              create: input.categoryIds
                .filter((id): id is number => typeof id === 'number' && id > 0)
                .map((categoryId) => ({
                  categoryId
                }))
            }
          : undefined
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

export const updateProduct = async (id: number, input: UpdateProductInput) => {
  return prisma.$transaction(async (tx) => {
    // If categoryIds are provided, update the many-to-many relationship
    if (input.categoryIds !== undefined) {
      // Delete all existing category relationships
      await tx.productCategory.deleteMany({
        where: { productId: id }
      }).catch((error) => {
        console.error('Error deleting product categories:', error);
        throw error;
      });

      // Create new category relationships
      if (input.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({
            productId: id,
            categoryId
          }))
        }).catch((error) => {
          console.error('Error creating product categories:', error);
          throw error;
        });
      }
    }

    // Update product fields
    return tx.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        gallery: input.gallery,
        colors: input.colors,
        sizes: input.sizes,
        itemType: input.itemType !== undefined ? input.itemType : undefined,
        inventory: input.inventory,
        inventoryVariants: input.inventoryVariants !== undefined ? input.inventoryVariants : undefined,
        priceCents: input.price !== undefined ? Math.round(input.price * 100) : undefined,
        isFeatured: input.isFeatured
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  });
};

export const deleteProduct = async (id: number) => {
  await prisma.product.delete({
    where: { id }
  });
};

