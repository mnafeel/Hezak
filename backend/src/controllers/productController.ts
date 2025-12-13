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
    console.log('🔍 getAllProducts called:', { 
      categorySlug, 
      useFirestore: USE_FIRESTORE,
      query: req.query 
    });
    
    const products = await listProducts(categorySlug);
    console.log('📦 Products fetched from service:', {
      count: Array.isArray(products) ? products.length : 'not array',
      isArray: Array.isArray(products),
      firstProduct: Array.isArray(products) && products.length > 0 ? {
        id: products[0].id,
        name: products[0].name,
        hasCategories: !!products[0].categories,
        categoryCount: Array.isArray(products[0].categories) ? products[0].categories.length : 0
      } : null
    });
    
    const serialized = products.map((product, index) => {
      try {
        const serializedProduct = serializeProduct(product);
        if (index === 0) {
          console.log('✅ First product serialized:', {
            id: serializedProduct.id,
            name: serializedProduct.name,
            hasCategory: !!serializedProduct.category,
            categoriesCount: Array.isArray(serializedProduct.categories) ? serializedProduct.categories.length : 0
          });
        }
        return serializedProduct;
      } catch (err) {
        console.error(`❌ Error serializing product ${product?.id}:`, err);
        return null;
      }
    }).filter((p): p is NonNullable<typeof p> => p !== null);
    
    console.log('📤 Sending products to client:', {
      totalFetched: products.length,
      totalSerialized: serialized.length,
      filteredOut: products.length - serialized.length
    });
    
    res.json(serialized);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
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
    console.log('➕ createProductHandler called:', {
      useFirestore: USE_FIRESTORE,
      bodyKeys: Object.keys(req.body || {}),
      hasCategoryIds: Array.isArray(req.body?.categoryIds)
    });
    
    const body = productSchema.parse(req.body);
    console.log('✅ Product schema validated:', {
      name: body.name,
      categoryIds: body.categoryIds,
      categoryIdsLength: Array.isArray(body.categoryIds) ? body.categoryIds.length : 0
    });
    
    const product = await createProduct(body);
    console.log('✅ Product created:', {
      id: product?.id,
      name: product?.name,
      hasCategories: !!product?.categories,
      categoryCount: Array.isArray(product?.categories) ? product?.categories.length : 0
    });
    
    const serialized = serializeProduct(product);
    console.log('✅ Product serialized:', {
      id: serialized.id,
      name: serialized.name,
      hasCategory: !!serialized.category,
      categoriesCount: Array.isArray(serialized.categories) ? serialized.categories.length : 0
    });
    
    res.status(201).json(serialized);
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

