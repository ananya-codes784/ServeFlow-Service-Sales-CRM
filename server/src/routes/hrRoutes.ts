import { Router } from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, logAttendance, getTechnicians, deleteEmployee } from '../controllers/hrController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.use(authenticateJWT);
router.get('/technicians', getTechnicians);
router.get('/employees', getEmployees);   // alias — /hr/employees also works
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/:id/attendance', logAttendance);

export default router;
