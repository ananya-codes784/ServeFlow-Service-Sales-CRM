import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
  recordPayment,
  getPayments,
  downloadPaymentReceipt,
  getRevenueStats,
} from '../controllers/financeController';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { UserRole } from '../shared';

const router = Router();

router.use(authenticateJWT);
router.get('/revenue-stats', getRevenueStats);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);
router.put('/invoices/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), updateInvoice);
router.delete('/invoices/:id', authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), deleteInvoice);
router.get('/invoices/:id/pdf', downloadInvoicePDF);
router.post('/invoices/:id/payment', recordPayment);
router.get('/payments', getPayments);
router.get('/payments/:id/receipt', downloadPaymentReceipt);

export default router;
