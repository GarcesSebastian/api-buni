import express from 'express';
import { GetSceneries, CreateScenery, UpdateScenery, DeleteScenery } from '../controllers/scenery.controller.js';

const router = express.Router();

router.get('/', GetSceneries);
router.post('/', CreateScenery);
router.put('/:id', UpdateScenery);
router.delete('/:id', DeleteScenery);

export default router; 