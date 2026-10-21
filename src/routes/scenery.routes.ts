import express from 'express';
import {
  GetSceneries,
  GetSceneryById,
  CreateScenery,
  UpdateScenery,
  DeleteScenery,
} from '../controllers/scenery.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { SceneryCreate, SceneryUpdate } from '../schemas/index.js';

const router = express.Router();

router.get('/', GetSceneries);
router.get('/:id', GetSceneryById);
router.post(
  '/',
  authenticate,
  requirePermission('scenery', 'create'),
  validate({ body: SceneryCreate }),
  CreateScenery,
);
router.put(
  '/:id',
  authenticate,
  requirePermission('scenery', 'edit'),
  validate({ body: SceneryUpdate }),
  UpdateScenery,
);
router.delete('/:id', authenticate, requirePermission('scenery', 'delete'), DeleteScenery);

export default router;
