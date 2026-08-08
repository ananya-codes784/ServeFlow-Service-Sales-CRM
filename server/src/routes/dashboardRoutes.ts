import { Router } from 'express';
import { getAdminDashboard } from '../controllers/dashboardController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.use(authenticateJWT);
router.get('/admin', getAdminDashboard);

export default router;
