import { pool } from '../database/config.js';
import bcrypt from 'bcryptjs';
import { UserModule } from '../models/user.module.js';

export const getUsers = async () => {
    try {
        const users = await UserModule.getUsers();
        return users;
    } catch (error) {
        console.error('Error en getUsers:', error);
        throw new Error('Error al obtener los usuarios de la base de datos');
    }
};

export const createUser = async (userData) => {
    try {
        const { name, email, password, roles } = userData;
        
        if (!name || !email || !password || !roles) {
            throw new Error('Todos los campos son requeridos');
        }

        const existingEmail = await UserModule.getUserByEmail(email);
        if (existingEmail) {
            throw new Error('El email ya está registrado');
        }

        const existingName = await UserModule.getUserByName(name);
        if (existingName) {
            throw new Error('El nombre ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const payload = {
            name,
            email,
            password: hashedPassword,
            role_id: roles.id
        }

        const result = await UserModule.createUser(payload);

        return {
            id: result.insertId,
            ...payload
        };
    } catch (error) {
        console.error('Error en createUser:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya está registrado')) {
            throw error;
        }
        throw new Error('Error al crear el usuario en la base de datos');
    }
};

export const updateUser = async (id, userData) => {
    try {
        const { name, email, password, roles } = userData;

        if (!name || !email || !password || !roles) {
            throw new Error('Todos los campos son requeridos');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await UserModule.updateUser(id, { name, email, password: hashedPassword, role_id: roles.id });

        if (result.affectedRows === 0) {
            throw new Error('Usuario no encontrado');
        }

        return true;
    } catch (error) {
        console.error('Error en updateUser:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrado')) {
            throw error;
        }
        throw new Error('Error al actualizar el usuario en la base de datos');
    }
};

export const deleteUser = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del usuario es requerido');
        }

        const result = await UserModule.deleteUser(id);

        if (result.affectedRows === 0) {
            throw new Error('Usuario no encontrado');
        }

        return true;
    } catch (error) {
        console.error('Error en deleteUser:', error);
        if (error.message.includes('requerido') || error.message.includes('no encontrado')) {
            throw error;
        }
        throw new Error('Error al eliminar el usuario de la base de datos');
    }
}; 