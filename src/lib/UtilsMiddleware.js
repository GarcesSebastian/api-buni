import { pool } from '../database/config.js';
import jwt from 'jsonwebtoken';

export class UtilsMiddleware {
    static instance = null;
    constructor() {}

    static getInstance() {
        if(!UtilsMiddleware.instance) {
            UtilsMiddleware.instance = new UtilsMiddleware();
        }
        return UtilsMiddleware.instance;
    }
    
    async start(req, res, next) {
        try {
            if (!req.headers.authorization) {
                throw new Error('No tienes permisos para realizar esta acción');
            }
            
            const token = req.headers.authorization.split(' ')[1];
        
            if (!token) {
                throw new Error('No tienes permisos para realizar esta acción');
            }
        
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
            if(decoded.permissions == "***") {
                next();
                return { permissions: "***" };
            }

            const [role] = await pool.query('SELECT * FROM roles WHERE name = ?', [decoded.role]);
            const role_permissions = typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions;

            if(!role) {
                throw new Error('No tienes permisos para realizar esta acción');
            }

            return role_permissions;
        } catch (error) {
            throw error;
        }
    }
}
