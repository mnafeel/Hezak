import { Router } from 'express';
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getAllCategories,
  updateCategoryHandler,
  updateCategoryProductsHandler
} from '../controllers/categoryController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

router.get('/', getAllCategories);
router.post('/', requireAdminAuth, createCategoryHandler);
router.put('/:id', requireAdminAuth, updateCategoryHandler);
router.put('/:id/products', requireAdminAuth, updateCategoryProductsHandler);
router.delete('/:id', requireAdminAuth, deleteCategoryHandler);

export const categoryRouter = router;

