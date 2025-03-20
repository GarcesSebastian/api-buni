import express from 'express';
import { GetUsers, CreateUser, GetDataIP } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/get', GetUsers);
router.get("/ip", GetDataIP)
router.post("/create", CreateUser)

export default router;
