"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductHandler = exports.updateProductHandler = exports.createProductHandler = exports.getSingleProduct = exports.getAllProducts = void 0;
const zod_1 = require("zod");
const database_1 = require("../config/database");
const productService_1 = require("../services/productService");
const productService_2 = require("../services/firestore/productService");
// Use Firestore or Prisma based on config
const listProducts = database_1.USE_FIRESTORE ? productService_2.listProducts : productService_1.listProducts;
const getProductById = database_1.USE_FIRESTORE ? productService_2.getProductById : productService_1.getProductById;
const createProduct = database_1.USE_FIRESTORE ? productService_2.createProduct : productService_1.createProduct;
const updateProduct = database_1.USE_FIRESTORE ? productService_2.updateProduct : productService_1.updateProduct;
const deleteProduct = database_1.USE_FIRESTORE ? productService_2.deleteProduct : productService_1.deleteProduct;
const product_1 = require("../schemas/product");
const serializers_1 = require("../utils/serializers");
const productIdParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive()
});
const getAllProducts = async (req, res) => {
    try {
        const categorySlug = req.query.category?.toString();
        console.log('🔍 getAllProducts called:', {
            categorySlug,
            useFirestore: database_1.USE_FIRESTORE,
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
                const serializedProduct = (0, serializers_1.serializeProduct)(product);
                if (index === 0) {
                    console.log('✅ First product serialized:', {
                        id: serializedProduct.id,
                        name: serializedProduct.name,
                        hasCategory: !!serializedProduct.category,
                        categoriesCount: Array.isArray(serializedProduct.categories) ? serializedProduct.categories.length : 0
                    });
                }
                return serializedProduct;
            }
            catch (err) {
                console.error(`❌ Error serializing product ${product?.id}:`, err);
                return null;
            }
        }).filter((p) => p !== null);
        console.log('📤 Sending products to client:', {
            totalFetched: products.length,
            totalSerialized: serialized.length,
            filteredOut: products.length - serialized.length
        });
        res.json(serialized);
    }
    catch (error) {
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
exports.getAllProducts = getAllProducts;
const getSingleProduct = async (req, res) => {
    try {
        const { id } = productIdParamSchema.parse(req.params);
        const product = await getProductById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json((0, serializers_1.serializeProduct)(product));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid product id' });
        }
        res.status(500).json({ message: 'Failed to fetch product' });
    }
};
exports.getSingleProduct = getSingleProduct;
const createProductHandler = async (req, res) => {
    try {
        console.log('➕ createProductHandler called:', {
            useFirestore: database_1.USE_FIRESTORE,
            bodyKeys: Object.keys(req.body || {}),
            hasCategoryIds: Array.isArray(req.body?.categoryIds)
        });
        const body = product_1.productSchema.parse(req.body);
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
        const serialized = (0, serializers_1.serializeProduct)(product);
        console.log('✅ Product serialized:', {
            id: serialized.id,
            name: serialized.name,
            hasCategory: !!serialized.category,
            categoriesCount: Array.isArray(serialized.categories) ? serialized.categories.length : 0
        });
        res.status(201).json(serialized);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
exports.createProductHandler = createProductHandler;
const updateProductHandler = async (req, res) => {
    try {
        const { id } = productIdParamSchema.parse(req.params);
        const body = product_1.updateProductSchema.parse(req.body);
        const product = await updateProduct(id, body);
        res.json((0, serializers_1.serializeProduct)(product));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res
                .status(400)
                .json({ message: 'Invalid product update payload', issues: error.issues });
        }
        res.status(500).json({ message: 'Failed to update product' });
    }
};
exports.updateProductHandler = updateProductHandler;
const deleteProductHandler = async (req, res) => {
    try {
        const { id } = productIdParamSchema.parse(req.params);
        await deleteProduct(id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid product id' });
        }
        res.status(500).json({ message: 'Failed to delete product' });
    }
};
exports.deleteProductHandler = deleteProductHandler;
//# sourceMappingURL=productController.js.map