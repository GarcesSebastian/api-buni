import { pool } from '../database/config.js';
import jwt from 'jsonwebtoken';
import { getUsers } from '../services/user.service.js';
import { getEvents } from '../services/events.service.js';
import { getPrograms } from '../services/programs.service.js';
import { getSceneries } from '../services/scenery.service.js';
import { getForms } from '../services/forms.service.js';
import { getRoles } from '../services/roles.service.js';

const entityServices = {
    users: getUsers,
    events: getEvents,
    programs: getPrograms,
    sceneries: getSceneries,
    forms: getForms,
    roles: getRoles
};

export const getDataUserMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para obtener datos' });
    }
    
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para obtener datos' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            const data = {};
            for (const [entity, service] of Object.entries(entityServices)) {
                data[entity] = await service();
            }
            req.body = { ...req.body, ...data };
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        
        const data = {};
        for (const [entity, service] of Object.entries(entityServices)) {
            const hasPermission = role_permissions[entity]?.["view"] || false;

            if (!hasPermission) {
                data[entity] = [];
            } else {
                data[entity] = await service();
            }
        }

        req.body = { ...req.body, ...data };
        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const getUsersMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para obtener usuarios' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para obtener usuarios' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const users_permissions = role_permissions.users;
        const { view } = users_permissions;

        if(!view) {
            return res.status(401).json({ error: 'No tienes permisos para obtener usuarios' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}


export const createUserMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para crear usuarios' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para crear usuarios' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const users_permissions = role_permissions.users;
        const { create } = users_permissions;

        if(!create) {
            return res.status(401).json({ error: 'No tienes permisos para crear usuarios' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const updateUserMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar usuarios' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para actualizar usuarios' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const users_permissions = role_permissions.users;
        const { edit } = users_permissions;

        if(!edit) {
            return res.status(401).json({ error: 'No tienes permisos para actualizar usuarios' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export const deleteUserMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar usuarios' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No tienes permisos para eliminar usuarios' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.permissions == "***") {
            next();
            return;
        }

        const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
        const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;
        const users_permissions = role_permissions.users;
        const { delete: delete_permission } = users_permissions;

        if(!delete_permission) {
            return res.status(401).json({ error: 'No tienes permisos para eliminar usuarios' });
        }

        next();
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
} 