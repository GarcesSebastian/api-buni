import { Router } from 'express';
import { GetEvents, CreateEvent, UpdateEvent, DeleteEvent } from '../controllers/events.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = Router();


router.get('/', verifyToken, GetEvents);
router.post('/', verifyToken, CreateEvent);
router.put('/:id', verifyToken, UpdateEvent);
router.delete('/:id', verifyToken, DeleteEvent);

export default router;