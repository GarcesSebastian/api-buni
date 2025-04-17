import { pool } from '../database/config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_ROLE = 'admin';

const isAdmin = (user) => {
    return user.role === ADMIN_ROLE;
};

export const VerifySession = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(401).json({ 
                valid: false,
                error: 'Token no proporcionado' 
            });
        }

        if (typeof token !== 'string') {
            console.error('Token no es un string:', token);
            return res.status(401).json({ 
                valid: false,
                error: 'Formato de token inválido' 
            });
        }

        if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
            console.error('Token malformado:', token);
            return res.status(401).json({ 
                valid: false,
                error: 'Token malformado' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decoded;

        if (user.role === ADMIN_ROLE) {
            return res.json({
                valid: true,
                user: {
                    name: process.env.ADMIN_NAME,
                    email: user.email,
                    role: ADMIN_ROLE
                }
            });
        }

        const [customRole] = await pool.query('SELECT permissions FROM roles WHERE name = ?', [user.role]);
        const permissions = customRole.length > 0 ? JSON.parse(customRole[0].permissions) : null;

        return res.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                permissions
            }
        });
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({ 
            valid: false,
            error: 'Token inválido',
            details: error.message
        });
    }
};

export const CreateCustomRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        if (!name || !permissions) {
            return res.status(400).json({ error: 'Se requieren nombre y permisos' });
        }

        let permissionsJson;
        try {
            permissionsJson = typeof permissions === 'string' 
                ? JSON.parse(permissions) 
                : permissions;
        } catch (error) {
            return res.status(400).json({ error: 'Formato de permisos inválido' });
        }

        if (typeof permissionsJson !== 'object' || permissionsJson === null) {
            return res.status(400).json({ error: 'Los permisos deben ser un objeto' });
        }

        const [result] = await pool.query(
            'INSERT INTO roles (name, permissions) VALUES (?, ?)',
            [name, JSON.stringify(permissionsJson)]
        );

        return res.status(201).json({
            id: result.insertId,
            name,
            permissions: permissionsJson,
            created_at: new Date()
        });
    } catch (error) {
        console.error('Error al crear rol:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const GetCustomRoles = async (req, res) => {
    try {
        const [roles] = await pool.query('SELECT * FROM roles');
        
        const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            permissions: typeof role.permissions === 'string' 
                ? JSON.parse(role.permissions) 
                : role.permissions,
            created_at: role.created_at
        }));

        return res.json(formattedRoles);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const GetUsers = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
        }

        const [users] = await pool.query('SELECT id, name, email, password, role_id FROM users');

        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const CreateUser = async (req, res) => {
    try {
        const { name, email, password, roles } = req.body;
        
        if (!name || !email || !password || !roles) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)', 
            [name, email, hashedPassword, roles.id]
        );
        
        return res.status(201).json({ 
            message: 'Usuario creado exitosamente',
            user: {
                name,
                email,
                role: roles.name
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { 
                    email,
                    role: ADMIN_ROLE
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                user: {
                    name: process.env.ADMIN_NAME,
                    email,
                    role: ADMIN_ROLE
                }
            });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const [role] = await pool.query('SELECT permissions FROM roles WHERE id = ?', [user.role_id]);
        const permissions = role.length > 0 ? JSON.parse(role[0].permissions) : null;

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

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

export const UpdateCustomRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;

        if (!name || !permissions) {
            return res.status(400).json({ error: 'Se requieren nombre y permisos' });
        }

        let permissionsJson;
        try {
            permissionsJson = typeof permissions === 'string' 
                ? JSON.parse(permissions) 
                : permissions;
        } catch (error) {
            return res.status(400).json({ error: 'Formato de permisos inválido' });
        }

        if (typeof permissionsJson !== 'object' || permissionsJson === null) {
            return res.status(400).json({ error: 'Los permisos deben ser un objeto' });
        }

        const [existingRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        if (existingRole.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        const [existingName] = await pool.query(
            'SELECT * FROM roles WHERE name = ? AND id != ?',
            [name, id]
        );
        if (existingName.length > 0) {
            return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
        }

        await pool.query(
            'UPDATE roles SET name = ?, permissions = ? WHERE id = ?',
            [name, JSON.stringify(permissionsJson), id]
        );

        return res.json({
            id: parseInt(id),
            name,
            permissions: permissionsJson,
            created_at: existingRole[0].created_at
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const DeleteCustomRole = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(id)

        const [existingRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        if (existingRole.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        const [usersWithRole] = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
            [existingRole[0].id]
        );

        if (usersWithRole[0].count > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar el rol porque hay usuarios que lo están utilizando' 
            });
        }

        await pool.query('DELETE FROM roles WHERE id = ?', [id]);

        return res.json({ 
            message: 'Rol eliminado exitosamente',
            deletedRole: {
                id: parseInt(id),
                name: existingRole[0].name
            }
        });
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};