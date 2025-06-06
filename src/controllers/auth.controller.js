import { pool } from '../database/config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUsers } from '../services/user.service.js';
import { UserModule } from '../models/user.module.js';

export const VerifySession = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        if (typeof token !== 'string') {
            console.error('Token no es un string:', token);
            return res.status(401).json({ error: 'Formato de token inválido' });
        }

        if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
            console.error('Token malformado:', token);
            return res.status(401).json({ error: 'Token malformado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const payload = {
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions
        }

        if (decoded.email === process.env.ADMIN_EMAIL) {
            return res.json({
                valid: true,
                user: payload
            });
        }

        const [customRole] = await pool.query('SELECT permissions FROM roles WHERE name = ?', [decoded.role]);
        const permissions = customRole.length > 0 ? typeof customRole[0].permissions === 'string' ? JSON.parse(customRole[0].permissions) : customRole[0].permissions : null;

        return res.json({
            valid: true,
            user: {
                ...payload,
                permissions
            }
        });
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        return res.status(500).json({ error: error.message || 'Error al verificar la sesión' });
    }
};

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const payload = {
                name: process.env.ADMIN_NAME,
                email,
                role: process.env.ADMIN_ROLE,
                permissions: "***"
            }

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                user: payload
            });
        }

        const users = await getUsers();
        const user = users.find(u => u.email === email);
        const passwordUser = await UserModule.getPasswordByUserId(user.id);
        if (!passwordUser) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, passwordUser.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const [role] = await pool.query('SELECT name, permissions FROM roles WHERE id = ?', [user.role_id]);
        const permissions = role.length > 0 ? typeof role[0].permissions === 'string' ? JSON.parse(role[0].permissions) : role[0].permissions : null;

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: role[0].name,
            permissions
        }

        const token = jwt.sign(
            userData,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            token,
            user: userData
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ error: error.message || 'Error al iniciar sesión' });
    }
};

export const CreateSession = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const isAdmin = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
         
        if(!isAdmin) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const payload = {
            email,
            role: process.env.ADMIN_ROLE,
            permissions: "***"
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            token,
            user: payload
        });
    } catch (error) {
        console.error('Error al crear sesión:', error);
        return res.status(500).json({ error: error.message || 'Error al crear sesión' });
    }
}

export const Logout = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                error: 'Token no proporcionado' 
            });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ 
                error: 'Token inválido' 
            });
        }

        return res.json({ 
            message: 'Sesión cerrada exitosamente' 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};