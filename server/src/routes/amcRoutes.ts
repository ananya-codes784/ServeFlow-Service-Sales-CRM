import { Router } from 'express';
import {
  getAMCContracts,
  getAMCContractById,
  createAMCContract,
  updateAMCContract,
  deleteAMCContract,
  getExpiringContracts,
  getAMCDueServices,
  sendAMCRenewalReminder,
  recordAMCVisit,
} from '../controllers/amcController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/expiring', getExpiringContracts);
router.get('/service-due', getAMCDueServices);
router.get('/', getAMCContracts);
router.get('/:id', getAMCContractById);
router.post('/service-due', getAMCDueServices);
router.post('/:id/send-reminder', sendAMCRenewalReminder);
router.post('/:id/record-visit', recordAMCVisit);
router.post('/', createAMCContract);
router.put('/:id', updateAMCContract);
router.delete('/:id', deleteAMCContract);

export default router;

