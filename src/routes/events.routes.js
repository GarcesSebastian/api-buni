import { Router } from 'express';
import { GetEvents, GetEventById, CreateEvent, UpdateEvent, DeleteEvent, UpdateEventForm } from '../controllers/events.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createEventMiddleware, updateEventMiddleware, deleteEventMiddleware } from '../middleware/event.middleware.js';

const router = Router();


router.get('/', GetEvents);
router.get('/:id', GetEventById);
router.post('/', verifyToken, createEventMiddleware, CreateEvent);
router.put('/:id', verifyToken, updateEventMiddleware, UpdateEvent);
router.put('/:id/forms', UpdateEventForm);
router.delete('/:id', verifyToken, deleteEventMiddleware, DeleteEvent);


export default router;