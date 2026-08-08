import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.put('/change-password', authenticateJWT, changePassword);

export default router;
