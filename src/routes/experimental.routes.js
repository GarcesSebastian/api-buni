import { Router } from 'express';
import { deleteEvents, deleteForms, deleteUsers, deleteRoles, deleteScenery, deleteFaculty, deleteAll } from '../controllers/experimental.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.delete('/events', verifyToken, deleteEvents);
router.delete('/forms', verifyToken, deleteForms);
router.delete('/users', verifyToken, deleteUsers);
router.delete('/roles', verifyToken, deleteRoles);
router.delete('/scenery', verifyToken, deleteScenery);
router.delete('/faculty', verifyToken, deleteFaculty);
router.delete('/all', verifyToken, deleteAll);

export default router;
