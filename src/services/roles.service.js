import { pool } from '../database/config.js';

export const getRoles = async () => {
    try {
        const [roles] = await pool.query('SELECT * FROM roles');
        return roles.map(role => ({
            ...role,
            permissions: typeof role.permissions === 'string' 
                ? JSON.parse(role.permissions) 
                : role.permissions
        }));
    } catch (error) {
        console.error('Error en getRoles:', error);
        throw new Error('Error al obtener los roles de la base de datos');
    }
};

export const createRole = async (name, permissions) => {
    try {
        if (!name || !permissions) {
            throw new Error('El nombre y los permisos son requeridos');
        }

        const [existingRole] = await pool.query('SELECT * FROM roles WHERE name = ?', [name]);
        if (existingRole.length > 0) {
            throw new Error('Ya existe un rol con ese nombre');
        }

        const [result] = await pool.query(
            'INSERT INTO roles (name, permissions) VALUES (?, ?)',
            [name, JSON.stringify(permissions)]
        );

        return {
            id: result.insertId,
            name,
            permissions,
            created_at: new Date()
        };
    } catch (error) {
        console.error('Error en createRole:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            throw error;
        }
        throw new Error('Error al crear el rol en la base de datos');
    }
};

export const updateRole = async (id, name, permissions) => {
    try {
        if (!id || !name || !permissions) {
            throw new Error('El ID, nombre y permisos son requeridos');
        }

        const [existingRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        if (existingRole.length === 0) {
            throw new Error('Rol no encontrado');
        }

        const [existingName] = await pool.query(
            'SELECT * FROM roles WHERE name = ? AND id != ?',
            [name, id]
        );

        if (existingName.length > 0) {
            throw new Error('Ya existe un rol con ese nombre');
        }

        await pool.query(
            'UPDATE roles SET name = ?, permissions = ? WHERE id = ?',
            [name, JSON.stringify(permissions), id]
        );

        return {
            id: parseInt(id),
            name,
            permissions,
            created_at: existingRole[0].created_at
        };
    } catch (error) {
        console.error('Error en updateRole:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrado') || error.message.includes('ya existe')) {
            throw error;
        }
        throw new Error('Error al actualizar el rol en la base de datos');
    }
};

export const deleteRole = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del rol es requerido');
        }

        const [existingRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        if (existingRole.length === 0) {
            throw new Error('Rol no encontrado');
        }

        const [usersWithRole] = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
            [id]
        );

        if (usersWithRole[0].count > 0) {
            throw new Error('No se puede eliminar el rol porque hay usuarios que lo están utilizando');
        }

        await pool.query('DELETE FROM roles WHERE id = ?', [id]);

        return {
            id: parseInt(id),
            name: existingRole[0].name
        };
    } catch (error) {
        console.error('Error en deleteRole:', error);
        if (error.message.includes('requerido') || error.message.includes('no encontrado') || error.message.includes('utilizando')) {
            throw error;
        }
        throw new Error('Error al eliminar el rol de la base de datos');
    }
}; 