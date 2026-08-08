import { Router } from 'express';
import { getLeaves, createLeave, updateLeaveStatus, deleteLeave } from '../controllers/leaveController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
router.use(authenticateJWT);
router.get('/', getLeaves);
router.post('/', createLeave);
router.put('/:id', updateLeaveStatus);
router.delete('/:id', deleteLeave);

export default router;
