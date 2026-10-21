import { Router } from 'express';
import {
  GetForms,
  GetFormById,
  CreateForm,
  UpdateForm,
  DeleteForm,
  GetFormData,
} from '../controllers/forms.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { FormCreate, FormUpdate } from '../schemas/index.js';

const router = Router();

router.get('/', GetForms);
router.get('/:type/:id', GetFormData);
router.get('/:id', GetFormById);
router.post(
  '/',
  authenticate,
  requirePermission('forms', 'create'),
  validate({ body: FormCreate }),
  CreateForm,
);
router.put(
  '/:id',
  authenticate,
  requirePermission('forms', 'edit'),
  validate({ body: FormUpdate }),
  UpdateForm,
);
router.delete('/:id', authenticate, requirePermission('forms', 'delete'), DeleteForm);

export default router;
