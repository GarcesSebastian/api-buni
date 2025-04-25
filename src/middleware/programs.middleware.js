import { pool } from '../database/config.js';
import jwt from 'jsonwebtoken';

export const createProgramMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para crear programas' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para crear programas' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const program_permissions = role_permissions.programs;
        const { create } = program_permissions;

        if(!create) {
            return res.status(401).json({ error: 'No tienes permisos para crear programas' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const updateProgramMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar programas' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar programas' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const program_permissions = role_permissions.programs;
        const { edit } = program_permissions;

        if(!edit) {
            return res.status(401).json({ error: 'No tienes permisos para actualizar programas' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const deleteProgramMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar programas' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar programas' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const program_permissions = role_permissions.programs;
        const { delete: delete_permission } = program_permissions;

        if(!delete_permission) {
            return res.status(401).json({ error: 'No tienes permisos para eliminar programas' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
} 