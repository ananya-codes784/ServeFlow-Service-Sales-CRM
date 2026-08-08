import { Router } from 'express';
import { getInventory, getInventoryById, createInventoryItem, updateInventoryItem, deleteInventoryItem, getLowStockItems } from '../controllers/inventoryController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/low-stock', getLowStockItems);
router.get('/', getInventory);
router.get('/:id', getInventoryById);
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), createInventoryItem);
router.put('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), updateInventoryItem);
router.delete('/:id', authorizeRoles(UserRole.ADMIN), deleteInventoryItem);

export default router;
