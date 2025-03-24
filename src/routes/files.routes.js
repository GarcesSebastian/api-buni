import express from 'express';
import { UploadXLSX } from '../controllers/files.controller.js';

const router = express.Router();

router.get('/upload/:name', UploadXLSX);

export default router;
