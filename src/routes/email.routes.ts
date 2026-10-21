import { Router } from 'express';
import { sendEmail } from '../controllers/email.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/send', sendEmail);

export default router;
