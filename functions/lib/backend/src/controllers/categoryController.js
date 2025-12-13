"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryProductsHandler = exports.deleteCategoryHandler = exports.updateCategoryHandler = exports.createCategoryHandler = exports.getAllCategories = void 0;
const zod_1 = require("zod");
const database_1 = require("../config/database");
const categoryService_1 = require("../services/categoryService");
const categoryService_2 = require("../services/firestore/categoryService");
// Use Firestore or Prisma based on config
const listCategories = database_1.USE_FIRESTORE ? categoryService_2.listCategories : categoryService_1.listCategories;
const getCategoryById = database_1.USE_FIRESTORE ? categoryService_2.getCategoryById : categoryService_1.getCategoryById;
const createCategory = database_1.USE_FIRESTORE ? categoryService_2.createCategory : categoryService_1.createCategory;
const updateCategory = database_1.USE_FIRESTORE ? categoryService_2.updateCategory : categoryService_1.updateCategory;
const deleteCategory = database_1.USE_FIRESTORE ? categoryService_2.deleteCategory : categoryService_1.deleteCategory;
const setCategoryProducts = database_1.USE_FIRESTORE ? categoryService_2.setCategoryProducts : categoryService_1.setCategoryProducts;
const category_1 = require("../schemas/category");
const serializers_1 = require("../utils/serializers");
const categoryIdParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive()
});
const getAllCategories = async (req, res) => {
    try {
        const includeProducts = typeof req.query.includeProducts === 'string'
            ? req.query.includeProducts === 'true'
            : false;
        const categories = await listCategories({ includeProducts });
        res.json(categories.map(serializers_1.serializeCategory));
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            message: 'Failed to fetch categories',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
};
exports.getAllCategories = getAllCategories;
const createCategoryHandler = async (req, res) => {
    try {
        const body = category_1.categorySchema.parse(req.body);
        const category = await createCategory(body);
        const categoryWithRelations = (await getCategoryById(category.id, { includeProducts: true })) ?? {
            ...category,
            _count: { products: 0 },
            products: []
        };
        res.status(201).json((0, serializers_1.serializeCategory)(categoryWithRelations));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
exports.createCategoryHandler = createCategoryHandler;
const updateCategoryHandler = async (req, res) => {
    try {
        const { id } = categoryIdParamSchema.parse(req.params);
        const body = category_1.updateCategorySchema.parse(req.body);
        const category = await updateCategory(id, body);
        const categoryWithRelations = (await getCategoryById(category.id, { includeProducts: true })) ?? {
            ...category,
            _count: { products: 0 },
            products: []
        };
        res.json((0, serializers_1.serializeCategory)(categoryWithRelations));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res
                .status(400)
                .json({ message: 'Invalid category update payload', issues: error.issues });
        }
        res.status(500).json({ message: 'Failed to update category' });
    }
};
exports.updateCategoryHandler = updateCategoryHandler;
const deleteCategoryHandler = async (req, res) => {
    try {
        const { id } = categoryIdParamSchema.parse(req.params);
        await deleteCategory(id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Invalid category id' });
        }
        res.status(500).json({ message: 'Failed to delete category' });
    }
};
exports.deleteCategoryHandler = deleteCategoryHandler;
const updateCategoryProductsHandler = async (req, res) => {
    try {
        const { id } = categoryIdParamSchema.parse(req.params);
        const body = category_1.categoryProductsSchema.parse(req.body);
        const productIds = body.productIds || [];
        const category = await setCategoryProducts(id, productIds);
        res.json((0, serializers_1.serializeCategory)(category));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('Validation error:', error.issues);
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
exports.updateCategoryProductsHandler = updateCategoryProductsHandler;
//# sourceMappingURL=categoryController.js.map