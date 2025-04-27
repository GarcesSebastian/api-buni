import { pool } from '../database/config.js';
import jwt from 'jsonwebtoken';

export const createEventMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para crear eventos' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para crear eventos' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(decoded.permissions == "***") {
        next();
        return;
    }

    const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
    const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
    const event_permissions = role_permissions.events;
    const { create } = event_permissions;

    if(!create) {
        return res.status(401).json({ error: 'No tienes permisos para crear eventos' });
    }

    next();
}

export const updateEventMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar eventos' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar eventos' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if(decoded.permissions == "***") {
        next();
        return;
    }

    const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
    const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;

    const event_permissions = role_permissions.events;
    const { edit } = event_permissions;

    if(!edit) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar eventos' });
    }

    next();
}

export const deleteEventMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar eventos' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar eventos' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(decoded.permissions == "***") {
        next();
        return;
    }

    const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
    const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;

    const event_permissions = role_permissions.events;
    const { delete: delete_permission } = event_permissions;

    if(!delete_permission) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar eventos' });
    }

    next();
}