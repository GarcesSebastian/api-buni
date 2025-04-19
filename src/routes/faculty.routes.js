import express from 'express';
import { GetFaculties, GetFacultyById, CreateFaculty, UpdateFaculty, DeleteFaculty } from '../controllers/faculty.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', GetFaculties);
router.get('/:id', GetFacultyById);
router.post('/', verifyToken, CreateFaculty);
router.put('/:id', verifyToken, UpdateFaculty);
router.delete('/:id', verifyToken, DeleteFaculty);

export default router; 