import { pool } from '../database/config.js';

export const getRoles = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM roles');
        return rows;
    } catch (error) {
        console.error('Error al obtener los roles:', error);
        throw error;
    }
}

export const getRoleById = async (id) => {
    try {
        const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        return rows[0];
    } catch (error) {
        console.error('Error al obtener el rol por ID:', error);
        throw error;
    }
}

export const createRole = async (role) => {
    try {
        const [result] = await pool.query('INSERT INTO roles SET ?', [role]);
        return result;
    } catch (error) {
        console.error('Error al crear el rol:', error);
        throw error;
    }
}

export const updateRole = async (id, role) => {
    try {   
        const [result] = await pool.query('UPDATE roles SET ? WHERE id = ?', [role, id]);
        return result;
    } catch (error) {
        console.error('Error al actualizar el rol:', error);
        throw error;
    }
}   

export const deleteRole = async (id) => {
    try {
        const [result] = await pool.query('DELETE FROM roles WHERE id = ?', [id]);
        return result;
    } catch (error) {
        console.error('Error al eliminar el rol:', error);
        throw error;
    }
}

const getUsersWithRole = async (id) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [id]);
        return rows[0].count;
    } catch (error) {
        console.error('Error al obtener los usuarios con el rol:', error);
        throw error;
    }
}

const getRoleByName = async (name) => {
    try {
        const [rows] = await pool.query('SELECT * FROM roles WHERE name = ?', [name]);
        return rows[0];
    } catch (error) {
        console.error('Error al obtener el rol por nombre:', error);
        throw error;
    }
}

export class RoleModule {
    static getRoleById = getRoleById;
    static createRole = createRole;
    static updateRole = updateRole;
    static deleteRole = deleteRole;
    static getUsersWithRole = getUsersWithRole;
    static getRoleByName = getRoleByName;
}
