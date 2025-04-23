import { pool } from '../database/config.js';
import jwt from 'jsonwebtoken';

export const createFormMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para crear formularios' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para crear formularios' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const forms_permissions = role_permissions.forms;
        const { create } = forms_permissions;

        if(!create) {
            return res.status(401).json({ error: 'No tienes permisos para crear formularios' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const updateFormMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar formularios' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar formularios' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const forms_permissions = role_permissions.forms;
        const { edit } = forms_permissions;

        if(!edit) {
            return res.status(401).json({ error: 'No tienes permisos para actualizar formularios' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const deleteFormMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar formularios' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar formularios' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const forms_permissions = role_permissions.forms;
        const { delete: delete_permission } = forms_permissions;

        if(!delete_permission) {
            return res.status(401).json({ error: 'No tienes permisos para eliminar formularios' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
} 