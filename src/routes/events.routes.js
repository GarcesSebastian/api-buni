import { Router } from 'express';
import { GetEvents, GetEventById, CreateEvent, UpdateEvent, DeleteEvent, UpdateEventForm } from '../controllers/events.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = Router();


router.get('/', GetEvents);
router.get('/:id', GetEventById);
router.post('/', verifyToken, CreateEvent);
router.put('/:id', verifyToken, UpdateEvent);
router.put('/:id/forms', UpdateEventForm);
router.delete('/:id', verifyToken, DeleteEvent);


export default router;