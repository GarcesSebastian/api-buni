import express from 'express';
import { GetSceneries, GetSceneryById, CreateScenery, UpdateScenery, DeleteScenery } from '../controllers/scenery.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', GetSceneries);
router.get('/:id', GetSceneryById);
router.post('/', verifyToken, CreateScenery);
router.put('/:id', verifyToken, UpdateScenery);
router.delete('/:id', verifyToken, DeleteScenery);

export default router; 