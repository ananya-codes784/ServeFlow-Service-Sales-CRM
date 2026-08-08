import { Router } from 'express';
import {
  getExpenses,
  createExpense,
  updateExpenseStatus,
  deleteExpense,
} from '../controllers/expenseController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id/status', updateExpenseStatus);
router.delete('/:id', deleteExpense);

export default router;
