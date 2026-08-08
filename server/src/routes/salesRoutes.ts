import { Router } from 'express';
import { getLeads, getLeadById, createLead, updateLead, deleteLead, addFollowUp, getQuotations, createQuotation } from '../controllers/salesController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/leads', getLeads);
router.get('/leads/:id', getLeadById);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);
router.delete('/leads/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), deleteLead);
router.post('/leads/:id/follow-up', addFollowUp);

router.get('/quotations', getQuotations);
router.post('/quotations', createQuotation);

export default router;
