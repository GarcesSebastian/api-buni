import express from 'express';
import { GetFaculties, GetFacultyById, CreateFaculty, UpdateFaculty, DeleteFaculty } from '../controllers/faculty.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createFacultyMiddleware, updateFacultyMiddleware, deleteFacultyMiddleware } from '../middleware/faculty.middleware.js';

const router = express.Router();

router.get('/', GetFaculties);
router.get('/:id', GetFacultyById);
router.post('/', verifyToken, createFacultyMiddleware, CreateFaculty);
router.put('/:id', verifyToken, updateFacultyMiddleware, UpdateFaculty);
router.delete('/:id', verifyToken, deleteFacultyMiddleware, DeleteFaculty);

export default router; 