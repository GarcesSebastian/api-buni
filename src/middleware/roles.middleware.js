import { pool } from '../database/config.js';
import jwt from 'jsonwebtoken';

export const createRoleMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para crear roles' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para crear roles' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const roles_permissions = role_permissions.roles;
        const { create } = roles_permissions;

        if(!create) {
            return res.status(401).json({ error: 'No tienes permisos para crear roles' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const updateRoleMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar roles' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar roles' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const roles_permissions = role_permissions.roles;
        const { edit } = roles_permissions;

        if(!edit) {
            return res.status(401).json({ error: 'No tienes permisos para actualizar roles' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const deleteRoleMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar roles' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar roles' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const roles_permissions = role_permissions.roles;
        const { delete: delete_permission } = roles_permissions;

        if(!delete_permission) {
            return res.status(401).json({ error: 'No tienes permisos para eliminar roles' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
} 