import { Router } from 'express';
import {
  getSpareIssues,
  createSpareIssue,
  updateSpareIssueStatus,
  deleteSpareIssue,
} from '../controllers/spareIssueController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/', getSpareIssues);
router.post('/', createSpareIssue);
router.put('/:id/status', updateSpareIssueStatus);
router.delete('/:id', deleteSpareIssue);

export default router;
