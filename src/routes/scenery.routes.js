import express from 'express';
import { GetSceneries, GetSceneryById, CreateScenery, UpdateScenery, DeleteScenery } from '../controllers/scenery.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createSceneryMiddleware, updateSceneryMiddleware, deleteSceneryMiddleware } from '../middleware/scenery.middleware.js';

const router = express.Router();

router.get('/', GetSceneries);
router.get('/:id', GetSceneryById);
router.post('/', verifyToken, createSceneryMiddleware, CreateScenery);
router.put('/:id', verifyToken, updateSceneryMiddleware, UpdateScenery);
router.delete('/:id', verifyToken, deleteSceneryMiddleware, DeleteScenery);

export default router; 