import express from 'express';
import { GetUsers, CreateUser, UpdateUser, DeleteUser, GetUserData, RecoveryPassword, VerifyRecoveryPassword, ChangePassword } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createUserMiddleware, updateUserMiddleware, deleteUserMiddleware, getUsersMiddleware } from '../middleware/user.middleware.js';
const router = express.Router();

// Rutas protegidas
router.get('/', verifyToken, getUsersMiddleware, GetUsers);
router.get('/data', verifyToken, GetUserData);
router.post("/", verifyToken, createUserMiddleware, CreateUser);
router.post('/:id/recovery', verifyToken, updateUserMiddleware, RecoveryPassword);
router.post('/:id/verify-recovery', verifyToken, updateUserMiddleware, VerifyRecoveryPassword);
router.post('/:id/change-password', verifyToken, updateUserMiddleware, ChangePassword);
router.put('/:id', verifyToken, updateUserMiddleware, UpdateUser);
router.delete('/:id', verifyToken, deleteUserMiddleware, DeleteUser);

export default router;