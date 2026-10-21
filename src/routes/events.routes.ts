import { Router } from 'express';
import {
  GetEvents,
  GetEventById,
  CreateEvent,
  UpdateEvent,
  DeleteEvent,
  UpdateEventForm,
  UpdateEventConfigForm,
} from '../controllers/events.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { EventCreate, EventUpdate, EventFormConfig, EventFormSubmission } from '../schemas/index.js';

const router = Router();

router.get('/', GetEvents);
router.get('/:id', GetEventById);
router.post(
  '/',
  authenticate,
  requirePermission('events', 'create'),
  validate({ body: EventCreate }),
  CreateEvent,
);
router.put(
  '/:id',
  authenticate,
  requirePermission('events', 'edit'),
  validate({ body: EventUpdate }),
  UpdateEvent,
);
// Public submission route — kept PERMANENTLY in parse-and-log for typeForm (never enforced).
router.put('/:id/forms', validate({ body: EventFormSubmission }), UpdateEventForm);
router.put(
  '/:id/form-config',
  authenticate,
  requirePermission('events', 'edit'),
  validate({ body: EventFormConfig }),
  UpdateEventConfigForm,
);
router.delete('/:id', authenticate, requirePermission('events', 'delete'), DeleteEvent);

export default router;
