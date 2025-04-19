import { pool } from '../database/config.js';

export const getSceneries = async () => {
    try {
        const [sceneries] = await pool.query('SELECT id, name, state FROM scenery');
        return sceneries;
    } catch (error) {
        console.error('Error en getSceneries:', error);
        throw new Error('Error al obtener los escenarios de la base de datos');
    }
};

export const getSceneryById = async (id) => {
    try {
        const [scenery] = await pool.query('SELECT id, name, state FROM scenery WHERE id = ?', [id]);

        if (scenery.length === 0) {
            throw new Error('Escenario no encontrado');
        }

        return scenery[0];
    } catch (error) {
        console.error('Error en getSceneryById:', error);
        throw new Error('Error al obtener el escenario de la base de datos');
    }
};

export const createScenery = async (name, state) => {
    try {
        if (!name || !state) {
            throw new Error('El nombre y el estado son requeridos');
        }

        const [existingScenery] = await pool.query('SELECT * FROM scenery WHERE name = ?', [name]);
        if (existingScenery.length > 0) {
            throw new Error('Ya existe un escenario con ese nombre');
        }

        const [result] = await pool.query(
            'INSERT INTO scenery (name, state) VALUES (?, ?)',
            [name, state]
        );

        return {
            id: result.insertId,
            name,
            state
        };
    } catch (error) {
        console.error('Error en createScenery:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            throw error;
        }
        throw new Error('Error al crear el escenario en la base de datos');
    }
};

export const updateScenery = async (id, name, state) => {
    try {
        if (!id || !name || !state) {
            throw new Error('El ID, nombre y estado son requeridos');
        }

        const [existingScenery] = await pool.query('SELECT * FROM scenery WHERE id = ?', [id]);
        if (existingScenery.length === 0) {
            throw new Error('Escenario no encontrado');
        }

        const [result] = await pool.query(
            'UPDATE scenery SET name = ?, state = ? WHERE id = ?',
            [name, state, id]
        );

        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar el escenario');
        }

        return {
            id,
            name,
            state
        };
    } catch (error) {
        console.error('Error en updateScenery:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrado') || error.message.includes('actualizar')) {
            throw error;
        }
        throw new Error('Error al actualizar el escenario en la base de datos');
    }
};

export const deleteScenery = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del escenario es requerido');
        }

        const [existingScenery] = await pool.query('SELECT * FROM scenery WHERE id = ?', [id]);
        if (existingScenery.length === 0) {
            throw new Error('Escenario no encontrado');
        }

        const [result] = await pool.query('DELETE FROM scenery WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('No se pudo eliminar el escenario');
        }

        return {
            id,
            message: 'Escenario eliminado exitosamente'
        };
    } catch (error) {
        console.error('Error en deleteScenery:', error);
        if (error.message.includes('requerido') || error.message.includes('no encontrado') || error.message.includes('eliminar')) {
            throw error;
        }
        throw new Error('Error al eliminar el escenario de la base de datos');
    }
}; 