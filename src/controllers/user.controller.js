import { ADMIN_ROLE } from '../config/admin.js';
import { getUsers, createUser, updateUser, deleteUser } from '../services/user.service.js';
import { getEvents } from '../services/events.service.js';
import { getFaculties } from '../services/faculty.service.js';
import { getSceneries } from '../services/scenery.service.js';
import { pool } from '../database/config.js';

const isAdmin = (user) => {
    return user.role === ADMIN_ROLE;
};

export const GetUsers = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
        }

        const users = await getUsers();
        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const GetUserData = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
        }

        const [roles] = await pool.query('SELECT id, name, permissions FROM roles');
        
        const userData = {
            events: await getEvents(),
            faculty: await getFaculties(),
            scenery: await getSceneries(),
            users: await getUsers(),
            roles: roles.map(role => ({
                ...role,
                permissions: JSON.parse(role.permissions)
            }))
        };

        return res.json(userData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const CreateUser = async (req, res) => {
    try {
        await createUser(req.body);
        return res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const UpdateUser = async (req, res) => {
    try {
        await updateUser(req.params.id, req.body);
        return res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const DeleteUser = async (req, res) => {
    try {
        await deleteUser(req.params.id);
        return res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};