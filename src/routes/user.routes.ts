import express from 'express';
import {
  GetUsers,
  CreateUser,
  UpdateUser,
  DeleteUser,
  GetUserData,
  RecoveryPassword,
  VerifyRecoveryPassword,
  ChangePassword,
} from '../controllers/user.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserCreate, UserUpdate } from '../schemas/index.js';

const router = express.Router();

// Rutas protegidas
router.get('/', authenticate, requirePermission('users', 'view'), GetUsers);
router.get('/data', authenticate, GetUserData);
router.post(
  '/',
  authenticate,
  requirePermission('users', 'create'),
  validate({ body: UserCreate }),
  CreateUser,
);
router.post('/:id/recovery', authenticate, requirePermission('users', 'edit'), RecoveryPassword);
router.post(
  '/:id/verify-recovery',
  authenticate,
  requirePermission('users', 'edit'),
  VerifyRecoveryPassword,
);
router.post(
  '/:id/change-password',
  authenticate,
  requirePermission('users', 'edit'),
  ChangePassword,
);
router.put(
  '/:id',
  authenticate,
  requirePermission('users', 'edit'),
  validate({ body: UserUpdate }),
  UpdateUser,
);
router.delete('/:id', authenticate, requirePermission('users', 'delete'), DeleteUser);

export default router;
