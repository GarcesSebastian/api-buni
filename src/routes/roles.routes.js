import express from 'express';
import { CreateCustomRole, GetCustomRoles, UpdateCustomRole, DeleteCustomRole } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, CreateCustomRole);
router.get('/', verifyToken, GetCustomRoles);
router.put('/:id', verifyToken, UpdateCustomRole);
router.delete('/:id', verifyToken, DeleteCustomRole);

export default router;

