import { Router } from 'express';
import { sendEmail } from "../controllers/email.controller.js";
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.post("/send", sendEmail);

export default router;