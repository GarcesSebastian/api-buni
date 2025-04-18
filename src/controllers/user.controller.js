import { pool } from '../database/config.js';
import { ADMIN_ROLE } from '../config/admin.js';

const isAdmin = (user) => {
    return user.role === ADMIN_ROLE;
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