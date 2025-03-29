import express from 'express';
import { GetUsers, CreateUser, Login, CreateCustomRole, GetCustomRoles, VerifySession, Logout, UpdateCustomRole, DeleteCustomRole } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.post("/login", Login);
router.post("/create", CreateUser);

// Rutas protegidas
router.post('/verify-session', VerifySession);
router.post('/logout', Logout);
router.get('/get', verifyToken, GetUsers);

// Rutas de gestión de roles (solo admin)
router.post('/roles', verifyToken, CreateCustomRole);
router.get('/roles', verifyToken, GetCustomRoles);
router.put('/roles/:id', verifyToken, UpdateCustomRole);
router.delete('/roles/:id', verifyToken, DeleteCustomRole);

export default router;
