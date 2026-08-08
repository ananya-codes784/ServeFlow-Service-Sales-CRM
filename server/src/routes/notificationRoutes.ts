import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from '../controllers/notificationController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.use(authenticateJWT);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/', clearAllNotifications);

export default router;
