import express from 'express';
import { UploadXLSX } from '../controllers/files.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Hardened in Phase 3: was public; now requires auth + files.read (no frontend caller exists — verified).
router.get('/upload/:name', authenticate, requirePermission('files', 'read'), UploadXLSX);

export default router;
