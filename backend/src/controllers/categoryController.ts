import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  setCategoryProducts,
  updateCategory
} from '../services/categoryService';
import {
  categoryProductsSchema,
  categorySchema,
  updateCategorySchema
} from '../schemas/category';
import { serializeCategory } from '../utils/serializers';

const categoryIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const includeProducts =
      typeof req.query.includeProducts === 'string'
        ? req.query.includeProducts === 'true'
        : false;

    const categories = await listCategories({ includeProducts });
    res.json(categories.map(serializeCategory));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

export const createCategoryHandler = async (req: Request, res: Response) => {
  try {
    const body = categorySchema.parse(req.body);
    const category = await createCategory(body);
    const categoryWithRelations =
      (await getCategoryById(category.id, { includeProducts: true })) ?? {
        ...category,
        _count: { products: 0 },
        products: []
      };
    res.status(201).json(serializeCategory(categoryWithRelations));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid category payload', issues: error.issues });
    }

    console.error('Error creating category:', error);
    res.status(500).json({ 
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

export const updateCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const body = updateCategorySchema.parse(req.body);
    const category = await updateCategory(id, body);
    const categoryWithRelations =
      (await getCategoryById(category.id, { includeProducts: true })) ?? {
        ...category,
        _count: { products: 0 },
        products: []
      };
    res.json(serializeCategory(categoryWithRelations));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid category update payload', issues: error.issues });
    }

    res.status(500).json({ message: 'Failed to update category' });
  }
};

export const deleteCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    await deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    res.status(500).json({ message: 'Failed to delete category' });
  }
};

export const updateCategoryProductsHandler = async (req: Request, res: Response) => {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const body = categoryProductsSchema.parse(req.body);
    const category = await setCategoryProducts(id, body.productIds);
    res.json(serializeCategory(category));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid category products payload', issues: error.issues });
    }

    console.error('Error updating category products:', error);
    res.status(500).json({ 
      message: 'Failed to update category products',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

