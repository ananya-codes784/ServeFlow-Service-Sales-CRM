import { Router } from 'express';
import { createUser, getAllUsers, updateUser, deleteUser, getSystemSettings, updateSystemSettings } from '../controllers/adminController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles(UserRole.ADMIN));
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
