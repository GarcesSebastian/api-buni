import express from 'express';
import { Login, VerifySession, Logout, CreateSession } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', Login);
router.post('/verify', VerifySession);
router.post('/logout', Logout);
router.post('/test', CreateSession);

export default router;