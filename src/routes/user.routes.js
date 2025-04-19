import express from 'express';
import { GetUsers, CreateUser, UpdateUser, DeleteUser, GetUserData } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas protegidas
router.get('/', verifyToken, GetUsers);
router.get('/data', verifyToken, GetUserData);
router.post("/", verifyToken, CreateUser);
router.put('/:id', verifyToken, UpdateUser);
router.delete('/:id', verifyToken, DeleteUser);

export default router;