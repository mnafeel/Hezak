import { Router } from 'express';
import {
  createProductHandler,
  deleteProductHandler,
  getAllProducts,
  getSingleProduct,
  updateProductHandler
} from '../controllers/productController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getSingleProduct);
router.post('/', requireAdminAuth, createProductHandler);
router.put('/:id', requireAdminAuth, updateProductHandler);
router.delete('/:id', requireAdminAuth, deleteProductHandler);

export const productRouter = router;


