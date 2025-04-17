import express from 'express';
import { GetUsers, CreateUser } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", CreateUser);
router.get('/', verifyToken, GetUsers);

export default router;