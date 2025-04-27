import { pool } from '../database/config.js';

const getForms = async () => {
    try {
        const [result] = await pool.query('SELECT * FROM forms');
        return result;
    } catch (error) {
        console.error('Error en getForms:', error);
        throw error;
    }
}

const getFormById = async (id) => {
    try {
        const [result] = await pool.query('SELECT * FROM forms WHERE id = ?', [id]);
        return result[0];
    } catch (error) {
        console.error('Error en getFormById:', error);
        throw error;
    }
}

const createForm = async (form) => {
    try {
        const [result] = await pool.query('INSERT INTO forms SET ?', [form]);
        return result;
    } catch (error) {
        console.error('Error en createForm:', error);
        throw error;
    }
}

const updateForm = async (id, form) => {
    try {
        const [result] = await pool.query('UPDATE forms SET ? WHERE id = ?', [form, id]);
        return result;
    } catch (error) {
        console.error('Error en updateForm:', error);
        throw error;
    }
}

const deleteForm = async (id) => {
    try {
        const [result] = await pool.query('DELETE FROM forms WHERE id = ?', [id]);
        return result;
    } catch (error) {
        console.error('Error en deleteForm:', error);
        throw error;
    }
}

const getFormByName = async (name) => {
    try {
        const [result] = await pool.query('SELECT * FROM forms WHERE name = ?', [name]);
        console.log(result);
        return result[0];
    } catch (error) {
        console.error('Error en getFormByName:', error);
        throw error;
    }
}

export class FormsModule {
    static getForms = getForms;
    static getFormById = getFormById;
    static createForm = createForm;
    static updateForm = updateForm;
    static deleteForm = deleteForm;
    static getFormByName = getFormByName;
}
