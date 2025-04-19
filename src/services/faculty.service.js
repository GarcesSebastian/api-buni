import { pool } from '../database/config.js';

export const getFaculties = async () => {
    try {
        const [faculties] = await pool.query('SELECT id, name, state FROM faculty');
        return faculties;
    } catch (error) {
        console.error('Error en getFaculties:', error);
        throw new Error('Error al obtener las facultades de la base de datos');
    }
};

export const getFacultyById = async (id) => {
    try {
        const [faculty] = await pool.query('SELECT id, name, state FROM faculty WHERE id = ?', [id]);

        if (faculty.length === 0) {
            throw new Error('Facultad no encontrada');
        }

        return faculty[0];
    } catch (error) {
        console.error('Error en getFacultyById:', error);
        throw new Error('Error al obtener la facultad de la base de datos');
    }
};

export const createFaculty = async (name, state) => {
    try {
        if (!name || !state) {
            throw new Error('El nombre y el estado son requeridos');
        }

        const [existingFaculty] = await pool.query('SELECT * FROM faculty WHERE name = ?', [name]);
        if (existingFaculty.length > 0) {
            throw new Error('Ya existe una facultad con ese nombre');
        }

        const [result] = await pool.query(
            'INSERT INTO faculty (name, state) VALUES (?, ?)',
            [name, state]
        );

        return {
            id: result.insertId,
            name,
            state
        };
    } catch (error) {
        console.error('Error en createFaculty:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            throw error;
        }
        throw new Error('Error al crear la facultad en la base de datos');
    }
};

export const updateFaculty = async (id, name, state) => {
    try {
        if (!id || !name || !state) {
            throw new Error('El ID, nombre y estado son requeridos');
        }

        const [existingFaculty] = await pool.query('SELECT * FROM faculty WHERE id = ?', [id]);
        if (existingFaculty.length === 0) {
            throw new Error('Facultad no encontrada');
        }

        const [result] = await pool.query(
            'UPDATE faculty SET name = ?, state = ? WHERE id = ?',
            [name, state, id]
        );

        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar la facultad');
        }

        return {
            id,
            name,
            state
        };
    } catch (error) {
        console.error('Error en updateFaculty:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrada') || error.message.includes('actualizar')) {
            throw error;
        }
        throw new Error('Error al actualizar la facultad en la base de datos');
    }
};

export const deleteFaculty = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID de la facultad es requerido');
        }

        const [existingFaculty] = await pool.query('SELECT * FROM faculty WHERE id = ?', [id]);
        if (existingFaculty.length === 0) {
            throw new Error('Facultad no encontrada');
        }

        const [result] = await pool.query('DELETE FROM faculty WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('No se pudo eliminar la facultad');
        }

        return {
            id,
            message: 'Facultad eliminada exitosamente'
        };
    } catch (error) {
        console.error('Error en deleteFaculty:', error);
        if (error.message.includes('requerido') || error.message.includes('no encontrada') || error.message.includes('eliminar')) {
            throw error;
        }
        throw new Error('Error al eliminar la facultad de la base de datos');
    }
}; 