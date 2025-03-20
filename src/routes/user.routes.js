import express from 'express';
import { GetUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/get', GetUsers);
// router.post("/create", CreateUser)

export default router;
