import { Router } from 'express';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, useTemplate } from '../controllers/msgTemplateController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
router.use(authenticateJWT);
router.get('/', getTemplates);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/:id/use', useTemplate);

export default router;
