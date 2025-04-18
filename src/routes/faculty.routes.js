import express from 'express';
import { GetFaculties, CreateFaculty, UpdateFaculty, DeleteFaculty } from '../controllers/faculty.controller.js';

const router = express.Router();

router.get('/', GetFaculties);
router.post('/', CreateFaculty);
router.put('/:id', UpdateFaculty);
router.delete('/:id', DeleteFaculty);

export default router; 