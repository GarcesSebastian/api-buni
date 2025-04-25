import { pool } from '../database/config.js';

export const getPrograms = async () => {
    try {
        const [programs] = await pool.query('SELECT id, name, state FROM programs');
        return programs;
    } catch (error) {
        console.error('Error en getPrograms:', error);
        throw new Error('Error al obtener los programas de la base de datos');
    }
};

export const getProgramById = async (id) => {
    try {
        const [program] = await pool.query('SELECT id, name, state FROM programs WHERE id = ?', [id]);

        if (program.length === 0) {
            throw new Error('Programa no encontrado');
        }

        return program[0];
    } catch (error) {
        console.error('Error en getProgramById:', error);
        throw new Error('Error al obtener el programa de la base de datos');
    }
};

export const createProgram = async (name, state) => {
    try {
        if (!name || !state) {
            throw new Error('El nombre y el estado son requeridos');
        }

        const [existingProgram] = await pool.query('SELECT * FROM programs WHERE name = ?', [name]);
        if (existingProgram.length > 0) {
            throw new Error('Ya existe un programa con ese nombre');
        }

        const [result] = await pool.query(
            'INSERT INTO programs (name, state) VALUES (?, ?)',
            [name, state]
        );

        return {
            id: result.insertId,
            name,
            state
        };
    } catch (error) {
        console.error('Error en createProgram:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            throw error;
        }
        throw new Error('Error al crear el programa en la base de datos');
    }
};

export const updateProgram = async (id, name, state) => {
    try {
        if (!id || !name || !state) {
            throw new Error('El ID, nombre y estado son requeridos');
        }

        const [existingProgram] = await pool.query('SELECT * FROM programs WHERE id = ?', [id]);
        if (existingProgram.length === 0) {
            throw new Error('Programa no encontrado');
        }

        const [result] = await pool.query(
            'UPDATE programs SET name = ?, state = ? WHERE id = ?',
            [name, state, id]
        );

        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar el programa');
        }

        return {
            id,
            name,
            state
        };
    } catch (error) {
        console.error('Error en updateProgram:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrada') || error.message.includes('actualizar')) {
            throw error;
        }
        throw new Error('Error al actualizar el programa en la base de datos');
    }
};

export const deleteProgram = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del programa es requerido');
        }

        const [existingProgram] = await pool.query('SELECT * FROM programs WHERE id = ?', [id]);
        if (existingProgram.length === 0) {
            throw new Error('Programa no encontrado');
        }

        const [result] = await pool.query('DELETE FROM programs WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('No se pudo eliminar el programa');
        }

        return {
            id,
            message: 'Programa eliminado exitosamente'
        };
    } catch (error) {
        console.error('Error en deleteProgram:', error);
        if (error.message.includes('requerido') || error.message.includes('no encontrada') || error.message.includes('eliminar')) {
            throw error;
        }
        throw new Error('Error al eliminar el programa de la base de datos');
    }
}; 