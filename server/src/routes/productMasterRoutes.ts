import { Router } from 'express';
import {
  getProductsMaster,
  getProductMasterById,
  createProductMaster,
  updateProductMaster,
  deleteProductMaster,
} from '../controllers/productMasterController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.use(authenticateJWT);
router.get('/', getProductsMaster);
router.get('/:id', getProductMasterById);
router.post('/', createProductMaster);
router.put('/:id', updateProductMaster);
router.delete('/:id', deleteProductMaster);

export default router;
