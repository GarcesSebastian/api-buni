import express from 'express';
import { GetUsers, CreateUser, UpdateUser, DeleteUser } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, GetUsers);
router.post("/", verifyToken, CreateUser);
router.put('/:id', verifyToken, UpdateUser);
router.delete('/:id', verifyToken, DeleteUser);

export default router;