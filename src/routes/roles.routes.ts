import express from 'express';
import {
  CreateCustomRole,
  GetCustomRoles,
  UpdateCustomRole,
  DeleteCustomRole,
} from '../controllers/roles.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { RoleCreate, RoleUpdate } from '../schemas/index.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  requirePermission('roles', 'create'),
  validate({ body: RoleCreate }),
  CreateCustomRole,
);
// GET /roles ran only verifyToken today (no roles-view middleware) — keep it authenticate-only.
router.get('/', authenticate, GetCustomRoles);
router.put(
  '/:id',
  authenticate,
  requirePermission('roles', 'edit'),
  validate({ body: RoleUpdate }),
  UpdateCustomRole,
);
router.delete('/:id', authenticate, requirePermission('roles', 'delete'), DeleteCustomRole);

export default router;
