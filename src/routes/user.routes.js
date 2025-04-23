import express from 'express';
import { GetUsers, CreateUser, UpdateUser, DeleteUser, GetUserData } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createUserMiddleware, updateUserMiddleware, deleteUserMiddleware, getUsersMiddleware, getDataUserMiddleware } from '../middleware/user.middleware.js';
const router = express.Router();

// Rutas protegidas
router.get('/', verifyToken, getUsersMiddleware, GetUsers);
router.get('/data', verifyToken, GetUserData);
router.post("/", verifyToken, createUserMiddleware, CreateUser);
router.put('/:id', verifyToken, updateUserMiddleware, UpdateUser);
router.delete('/:id', verifyToken, deleteUserMiddleware, DeleteUser);

export default router;