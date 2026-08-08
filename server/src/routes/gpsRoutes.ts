import { Router } from 'express';
import { getAllLocations, updateLocation, setOffDuty } from '../controllers/gpsController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
router.use(authenticateJWT);
router.get('/', getAllLocations);
router.post('/update', updateLocation);
router.put('/:id/off-duty', setOffDuty);

export default router;
