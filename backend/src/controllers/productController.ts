import { Request, Response } from 'express';
import { z } from 'zod';
import { USE_FIRESTORE } from '../config/database';
import {
  createProduct as createProductPrisma,
  deleteProduct as deleteProductPrisma,
  getProductById as getProductByIdPrisma,
  listProducts as listProductsPrisma,
  updateProduct as updateProductPrisma
} from '../services/productService';
import {
  createProduct as createProductFirestore,
  deleteProduct as deleteProductFirestore,
  getProductById as getProductByIdFirestore,
  listProducts as listProductsFirestore,
  updateProduct as updateProductFirestore
} from '../services/firestore/productService';

// Use Firestore or Prisma based on config
const listProducts = USE_FIRESTORE ? listProductsFirestore : listProductsPrisma;
const getProductById = USE_FIRESTORE ? getProductByIdFirestore : getProductByIdPrisma;
const createProduct = USE_FIRESTORE ? createProductFirestore : createProductPrisma;
const updateProduct = USE_FIRESTORE ? updateProductFirestore : updateProductPrisma;
const deleteProduct = USE_FIRESTORE ? deleteProductFirestore : deleteProductPrisma;
import { productSchema, updateProductSchema } from '../schemas/product';
import { serializeProduct } from '../utils/serializers';

const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const categorySlug = req.query.category?.toString();
    const products = await listProducts(categorySlug);
    res.json(products.map(serializeProduct));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSingleProduct = async (req: Request, res: Response) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(serializeProduct(product));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

export const createProductHandler = async (req: Request, res: Response) => {
  try {
    const body = productSchema.parse(req.body);
    const product = await createProduct(body);
    res.status(201).json(serializeProduct(product));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((issue) => {
        const path = issue.path.join('.');
        return `${path}: ${issue.message}`;
      });
      return res.status(400).json({ 
        message: 'Invalid product payload', 
        errors: errorMessages,
        issues: error.issues 
      });
    }

    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    const body = updateProductSchema.parse(req.body);
    const product = await updateProduct(id, body);
    res.json(serializeProduct(product));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid product update payload', issues: error.issues });
    }

    res.status(500).json({ message: 'Failed to update product' });
  }
};

export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    await deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

