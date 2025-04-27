import { pool } from '../database/config.js';

const getPrograms = async () => {
    try {
        const [result] = await pool.query('SELECT * FROM programs');
        return result;
    } catch (error) {
        console.error('Error en getPrograms:', error);
        throw error;
    }
}

const getProgramById = async (id) => {
    try {
        const [result] = await pool.query('SELECT * FROM programs WHERE id = ?', [id]);
        return result[0];
    } catch (error) {
        console.error('Error en getProgramById:', error);
        throw error;
    }
}   

const createProgram = async (program) => {
    try {
        const [result] = await pool.query('INSERT INTO programs SET ?', [program]);
        return result;
    } catch (error) {
        console.error('Error en createProgram:', error);
        throw error;
    }
}

const updateProgram = async (id, program) => {
    try {
        const [result] = await pool.query('UPDATE programs SET ? WHERE id = ?', [program, id]);
        return result;
    } catch (error) {
        console.error('Error en updateProgram:', error);
        throw error;
    }
}

const deleteProgram = async (id) => {
    try {
        const [result] = await pool.query('DELETE FROM programs WHERE id = ?', [id]);
        return result;
    } catch (error) {
        console.error('Error en deleteProgram:', error);
        throw error;
    }
}

const getProgramByName = async (name) => {  
    try {
        const [result] = await pool.query('SELECT * FROM programs WHERE name = ?', [name]);
        return result[0];
    } catch (error) {
        console.error('Error en getProgramByName:', error);
        throw error;
    }
}

export class ProgramsModule {
    static getPrograms = getPrograms;
    static getProgramById = getProgramById;
    static createProgram = createProgram;
    static updateProgram = updateProgram;
    static deleteProgram = deleteProgram;
    static getProgramByName = getProgramByName;
}
