import type { Category } from '../generated/prisma/client';
import { Prisma } from '../generated/prisma/client';
import { prisma } from '../utils/prisma';
import { type CategoryInput, type UpdateCategoryInput } from '../schemas/category';

type CategoryListPayload = Prisma.CategoryGetPayload<{
  include: {
    _count: { select: { products: true } };
    products?: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            itemType: true;
          };
        };
      };
    };
  };
}>;

type ListCategoryOptions = {
  includeProducts?: boolean;
};

export const listCategories = async (
  options: ListCategoryOptions = {}
): Promise<CategoryListPayload[]> => {
  try {
    // Start with simplest query possible
    const categories = await prisma.category.findMany({
      orderBy: [
        { isTopSelling: 'desc' },
        { name: 'asc' }
      ]
    });

    // If products are requested, fetch them separately
    let categoriesWithProducts = categories;
    if (options.includeProducts) {
      categoriesWithProducts = await Promise.all(
        categories.map(async (cat) => {
          const productCategories = await prisma.productCategory.findMany({
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
        })
      );
    }

    // Count products for each category
    const categoriesWithCount = await Promise.all(
      categoriesWithProducts.map(async (cat) => {
        const productCount = await prisma.productCategory.count({
          where: { categoryId: cat.id }
        });
        return {
          ...cat,
          _count: { products: productCount },
          products: 'products' in cat ? cat.products : undefined
        };
      })
    );

    return categoriesWithCount as CategoryListPayload[];
  } catch (error) {
    console.error('Error in listCategories:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
};

export const createCategory = async (input: CategoryInput): Promise<Category> => {
  try {
    return await prisma.$transaction(async (tx) => {
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
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  input: UpdateCategoryInput
): Promise<Category> => {
  return prisma.$transaction(async (tx) => {
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

    const updateData: Prisma.CategoryUpdateInput = {
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

export const deleteCategory = async (id: number): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    // Find products that belong ONLY to this category
    const productsInCategory = await tx.productCategory.findMany({
      where: { categoryId: id },
      include: {
        product: {
          include: {
            categories: true
          }
        }
      }
    });
    
    // Find products that belong only to this category
    const productsToDelete = productsInCategory
      .filter(pc => pc.product.categories.length === 1) // Only belongs to this category
      .map(pc => pc.productId);
    
    // Delete products that belong only to this category
    if (productsToDelete.length > 0) {
      // First delete order items for these products
      await tx.orderItem.deleteMany({
        where: {
          productId: { in: productsToDelete }
        }
      });
      
      // Delete product categories
      await tx.productCategory.deleteMany({
        where: {
          productId: { in: productsToDelete }
        }
      });
      
      // Delete the products
      await tx.product.deleteMany({
        where: {
          id: { in: productsToDelete }
        }
      });
    }
    
    // Remove category from products that belong to multiple categories
    await tx.productCategory.deleteMany({
      where: { categoryId: id }
    });
    
    // Delete the category
    await tx.category.delete({
      where: { id }
    });
  });
};

export const getCategoryById = async (
  id: number,
  options: ListCategoryOptions = {}
): Promise<CategoryListPayload | null> => {
  try {
    const include: Prisma.CategoryInclude = {};

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

    const category = await prisma.category.findUnique({
      where: { id },
      include
    });

    if (!category) {
      return null;
    }

    // Manually count products
    const productCount = await prisma.productCategory.count({
      where: { categoryId: id }
    });

    return {
      ...category,
      _count: { products: productCount }
    } as CategoryListPayload;
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    throw error;
  }
};

export const setCategoryProducts = async (
  categoryId: number,
  productIds: number[]
): Promise<CategoryListPayload> => {
  try {
    // Ensure productIds is an array
    const validProductIds = Array.isArray(productIds) ? productIds.filter((id): id is number => typeof id === 'number' && id > 0) : [];
    
    return prisma.$transaction(async (tx) => {
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
    } catch (error) {
      console.error('Error fetching current product categories:', error);
      console.error('Transaction client keys:', Object.keys(tx));
      throw new Error(`Failed to fetch current products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    const currentProductIds = currentProductCategories.map((pc) => pc.productId);

    // Find products to remove (in category but not in new list)
    const productsToRemove = currentProductIds.filter(
      (id) => !validProductIds.includes(id)
    );

    // Find products to add (in new list but not in category)
    const productsToAdd = validProductIds.filter(
      (id) => !currentProductIds.includes(id)
    );

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
      } as CategoryListPayload;
    });
  } catch (error) {
    console.error('Error in setCategoryProducts:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
};

