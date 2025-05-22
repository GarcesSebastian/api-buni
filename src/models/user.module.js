import { pool } from '../database/config.js';

const getUsers = async () => {
    try {
        const [result] = await pool.query('SELECT id, name, email, role_id FROM users');
        return result;
    } catch (error) {
        console.error('Error en getUsers:', error);
        throw error;
    }
};

const createUser = async (user) => {
    try {
        const [result] = await pool.query('INSERT INTO users SET ?', [user]);
        return result;
    } catch (error) {
        console.error('Error en createUser:', error);
        throw error;
    }
};

const updateUser = async (id, user) => {
    try {
        const [result] = await pool.query('UPDATE users SET ? WHERE id = ?', [user, id]);
        return result;
    } catch (error) {
        console.error('Error en updateUser:', error);
        throw error;
    }
};

const deleteUser = async (id) => {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result;
    } catch (error) {
        console.error('Error en deleteUser:', error);
        throw error;
    }
};

const getUserById = async (id) => {
    try {
        const [result] = await pool.query('SELECT id, name, email, role_id FROM users WHERE id = ?', [id]);
        return result[0];
    } catch (error) {
        console.error('Error en getUserById:', error);
        throw error;
    }
};

const getUserByEmail = async (email) => {
    try {
        const [result] = await pool.query('SELECT id, name, email, role_id FROM users WHERE email = ?', [email]);
        return result[0];
    } catch (error) {
        console.error('Error en getUserByEmail:', error);
        throw error;
    }
};

const getUserByName = async (name) => {
    try {
        const [result] = await pool.query('SELECT id, name, email, role_id FROM users WHERE name = ?', [name]);
        return result[0];
    } catch (error) {
        console.error('Error en getUserByName:', error);
        throw error;
    }
};

const getPasswordByUserId = async (id) => {
    try {
        const [result] = await pool.query('SELECT password FROM users WHERE id = ?', [id]);
        return result[0];
    } catch (error) {
        console.error('Error en getPasswordByUserId:', error);
        throw error;
    }
}

export class UserModule {
    static getUsers = getUsers;
    static createUser = createUser;
    static updateUser = updateUser;
    static deleteUser = deleteUser;
    static getUserById = getUserById;
    static getUserByEmail = getUserByEmail;
    static getUserByName = getUserByName;
    static getPasswordByUserId = getPasswordByUserId;
}








