import { Router } from 'express';
import { getServiceTickets, getServiceTicketById, createServiceTicket, updateServiceTicket, deleteServiceTicket } from '../controllers/serviceController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/', getServiceTickets);
router.get('/:id', getServiceTicketById);
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), createServiceTicket);
router.put('/:id', updateServiceTicket);
router.delete('/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), deleteServiceTicket);

export default router;
