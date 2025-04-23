import { pool } from '../database/config.js';
import jwt from 'jsonwebtoken';

export const createFacultyMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para crear facultades' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para crear facultades' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const faculty_permissions = role_permissions.faculty;
        const { create } = faculty_permissions;

        if(!create) {
            return res.status(401).json({ error: 'No tienes permisos para crear facultades' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const updateFacultyMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar facultades' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar facultades' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const faculty_permissions = role_permissions.faculty;
        const { edit } = faculty_permissions;

        if(!edit) {
            return res.status(401).json({ error: 'No tienes permisos para actualizar facultades' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const deleteFacultyMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar facultades' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar facultades' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const faculty_permissions = role_permissions.faculty;
        const { delete: delete_permission } = faculty_permissions;

        if(!delete_permission) {
            return res.status(401).json({ error: 'No tienes permisos para eliminar facultades' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
} 