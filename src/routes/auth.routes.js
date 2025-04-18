import express from 'express';
import { Login, VerifySession, Logout } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', Login);
router.post('/verify-session', VerifySession);
router.post('/logout', Logout);

export default router;