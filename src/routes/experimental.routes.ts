import { Router } from 'express';
import {
  deleteEvents,
  deleteForms,
  deleteUsers,
  deleteRoles,
  deleteScenery,
  deletePrograms,
  deleteAll,
} from '../controllers/experimental.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';

// Admin-only gate for every experimental route (design §3.2). Mounting is additionally gated to
// non-production in app.ts.
const adminOnly = [authenticate, requirePermission('experimental', 'delete')];

const router = Router();

router.delete('/events', ...adminOnly, deleteEvents);
router.delete('/forms', ...adminOnly, deleteForms);
router.delete('/users', ...adminOnly, deleteUsers);
router.delete('/roles', ...adminOnly, deleteRoles);
router.delete('/scenery', ...adminOnly, deleteScenery);
router.delete('/programs', ...adminOnly, deletePrograms);
router.delete('/all', ...adminOnly, deleteAll);

export default router;
