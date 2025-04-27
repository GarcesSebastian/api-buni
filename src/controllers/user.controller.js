import { getUsers, createUser, updateUser, deleteUser } from '../services/user.service.js';
import { getEvents } from '../services/events.service.js';
import { getPrograms } from '../services/programs.service.js';
import { getSceneries } from '../services/scenery.service.js';
import { getForms } from '../services/forms.service.js';
import { pool } from '../database/config.js';

export const GetUsers = async (req, res) => {
    try {
        const users = await getUsers();
        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const GetUserData = async (req, res) => {
    try {
        const [roles] = await pool.query('SELECT id, name, permissions FROM roles');
        
        const userData = {
            events: await getEvents(),
            programs: await getPrograms(),
            scenery: await getSceneries(),
            users: await getUsers(),
            forms: await getForms(),
            roles: roles.map(role => ({
                ...role,
                permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions
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
        const user = await createUser(req.body);
        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const UpdateUser = async (req, res) => {
    try {
        const user = await updateUser(req.params.id, req.body);
        return res.json({
            message: 'Usuario actualizado exitosamente',
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const DeleteUser = async (req, res) => {
    try {
        const user = await deleteUser(req.params.id);
        return res.json({
            message: 'Usuario eliminado exitosamente',
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};