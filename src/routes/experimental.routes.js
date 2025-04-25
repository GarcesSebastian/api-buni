import { Router } from 'express';
import { deleteEvents, deleteForms, deleteUsers, deleteRoles, deleteScenery, deletePrograms, deleteAll } from '../controllers/experimental.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.delete('/events', verifyToken, deleteEvents);
router.delete('/forms', verifyToken, deleteForms);
router.delete('/users', verifyToken, deleteUsers);
router.delete('/roles', verifyToken, deleteRoles);
router.delete('/scenery', verifyToken, deleteScenery);
router.delete('/programs', verifyToken, deletePrograms);
router.delete('/all', verifyToken, deleteAll);

export default router;
