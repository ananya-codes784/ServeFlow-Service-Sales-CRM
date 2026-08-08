import { Router } from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  allocateComplaint,
} from '../controllers/complaintController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/stats', getComplaintStats);
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.put('/:id/allocate', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), allocateComplaint);
router.put('/:id', updateComplaint);
router.delete('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), deleteComplaint);

export default router;

