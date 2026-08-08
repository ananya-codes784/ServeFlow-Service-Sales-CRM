import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerFull360,
  addCustomerProduct,
  deleteCustomerProduct,
} from '../controllers/customerController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.get('/:id/full', getCustomerFull360);
router.post('/', createCustomer);
router.post('/:id/products', addCustomerProduct);
router.delete('/:id/products/:productId', deleteCustomerProduct);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;

