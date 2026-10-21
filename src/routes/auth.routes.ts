import express from 'express';
import { Login, VerifySession, Logout, CreateSession } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { AuthLogin, AuthTokenBody } from '../schemas/index.js';

const router = express.Router();

router.post('/login', validate({ body: AuthLogin }), Login);
router.post('/verify', validate({ body: AuthTokenBody }), VerifySession);
router.post('/logout', validate({ body: AuthTokenBody }), Logout);
router.post('/test', validate({ body: AuthLogin }), CreateSession);

export default router;
