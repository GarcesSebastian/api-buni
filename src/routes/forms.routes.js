import { Router } from 'express';
import { GetForms, GetFormById, CreateForm, UpdateForm, DeleteForm, GetFormData } from '../controllers/forms.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createFormMiddleware, updateFormMiddleware, deleteFormMiddleware } from '../middleware/forms.middleware.js';

const router = Router();

router.get('/', GetForms);
router.get('/:type/:id', GetFormData);
router.get('/:id', GetFormById);
router.post('/', verifyToken, createFormMiddleware, CreateForm);
router.put('/:id', verifyToken, updateFormMiddleware, UpdateForm);
router.delete('/:id', verifyToken, deleteFormMiddleware, DeleteForm);

export default router;
