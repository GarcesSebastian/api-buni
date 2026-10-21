import express from 'express';
import {
  GetPrograms,
  GetProgramById,
  CreateProgram,
  UpdateProgram,
  DeleteProgram,
} from '../controllers/programs.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ProgramCreate, ProgramUpdate } from '../schemas/index.js';

const router = express.Router();

router.get('/', GetPrograms);
router.get('/:id', GetProgramById);
router.post(
  '/',
  authenticate,
  requirePermission('programs', 'create'),
  validate({ body: ProgramCreate }),
  CreateProgram,
);
router.put(
  '/:id',
  authenticate,
  requirePermission('programs', 'edit'),
  validate({ body: ProgramUpdate }),
  UpdateProgram,
);
router.delete('/:id', authenticate, requirePermission('programs', 'delete'), DeleteProgram);

export default router;
