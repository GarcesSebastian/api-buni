import express from 'express';
import { GetPrograms, GetProgramById, CreateProgram, UpdateProgram, DeleteProgram } from '../controllers/programs.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createProgramMiddleware, updateProgramMiddleware, deleteProgramMiddleware } from '../middleware/programs.middleware.js';

const router = express.Router();

router.get('/', GetPrograms);
router.get('/:id', GetProgramById);
router.post('/', verifyToken, createProgramMiddleware, CreateProgram);
router.put('/:id', verifyToken, updateProgramMiddleware, UpdateProgram);
router.delete('/:id', verifyToken, deleteProgramMiddleware, DeleteProgram);

export default router; 