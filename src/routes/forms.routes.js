import { Router } from 'express';
import { GetForms, GetFormById, CreateForm, UpdateForm, DeleteForm, GetFormData } from '../controllers/forms.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', GetForms);
router.get('/:type/:id', GetFormData);
router.get('/:id', GetFormById);
router.post('/', verifyToken, CreateForm);
router.put('/:id', verifyToken, UpdateForm);
router.delete('/:id', verifyToken, DeleteForm);

export default router;
