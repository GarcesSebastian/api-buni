import express from 'express';
import { CreateCustomRole, GetCustomRoles, UpdateCustomRole, DeleteCustomRole } from '../controllers/roles.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createRoleMiddleware, updateRoleMiddleware, deleteRoleMiddleware } from '../middleware/roles.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createRoleMiddleware, CreateCustomRole);
router.get('/', verifyToken, GetCustomRoles);
router.put('/:id', verifyToken, updateRoleMiddleware, UpdateCustomRole);
router.delete('/:id', verifyToken, deleteRoleMiddleware, DeleteCustomRole);

export default router;

