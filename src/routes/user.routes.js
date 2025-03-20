import express from 'express';
import { GetUsers, CreateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/get', GetUsers);
router.post("/create", CreateUser)

export default router;
