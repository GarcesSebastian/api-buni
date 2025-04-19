import { pool } from '../database/config.js';

export const getForms = async () => {
    try {
        const [forms] = await pool.query('SELECT id, name, description, fields, state FROM forms');
        return forms.map(form => ({
            ...form,
            fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields
        }));
    } catch (error) {
        console.error('Error en getForms:', error);
        throw new Error('Error al obtener los formularios de la base de datos');
    }
};

export const getFormById = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del formulario es requerido');
        }

        const [form] = await pool.query(
            'SELECT id, name, description, fields, state FROM forms WHERE id = ?',
            [id]
        );

        if (form.length === 0) {
            throw new Error('Formulario no encontrado');
        }

        const formData = form[0];
        return {
            ...formData,
            fields: typeof formData.fields === 'string' ? JSON.parse(formData.fields) : formData.fields
        };
    } catch (error) {
        console.error('Error en getFormById:', error);
        throw error;
    }
};

export const createForm = async (formData) => {
    try {
        const { name, description, fields, state } = formData;

        if (!name || !description || !fields || state === undefined) {
            throw new Error('Todos los campos son requeridos');
        }

        const [existingForm] = await pool.query('SELECT id FROM forms WHERE name = ?', [name]);
        if (existingForm.length > 0) {
            throw new Error('Ya existe un formulario con ese nombre');
        }

        const [result] = await pool.query(
            'INSERT INTO forms (name, description, fields, state) VALUES (?, ?, ?, ?)',
            [name, description, JSON.stringify(fields), state]
        );

        return {
            id: result.insertId,
            name,
            description,
            fields,
            state
        };
    } catch (error) {
        console.error('Error en createForm:', error);
        throw error;
    }
};

export const updateForm = async (id, formData) => {
    try {
        const { name, description, fields, state } = formData;

        if (!id || !name || !description || !fields || state === undefined) {
            throw new Error('Todos los campos son requeridos');
        }

        const [existingForm] = await pool.query('SELECT id FROM forms WHERE id = ?', [id]);
        if (existingForm.length === 0) {
            throw new Error('Formulario no encontrado');
        }

        const [nameForm] = await pool.query('SELECT id FROM forms WHERE name = ? AND id != ?', [name, id]);
        if (nameForm.length > 0) {
            throw new Error('Ya existe un formulario con ese nombre');
        }

        const [result] = await pool.query(
            'UPDATE forms SET name = ?, description = ?, fields = ?, state = ? WHERE id = ?',
            [name, description, JSON.stringify(fields), state, id]
        );

        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar el formulario');
        }

        return {
            id,
            name,
            description,
            fields,
            state
        };
    } catch (error) {
        console.error('Error en updateForm:', error);
        throw error;
    }
};

export const deleteForm = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del formulario es requerido');
        }

        const [existingForm] = await pool.query('SELECT id FROM forms WHERE id = ?', [id]);
        if (existingForm.length === 0) {
            throw new Error('Formulario no encontrado');
        }

        const [result] = await pool.query('DELETE FROM forms WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('No se pudo eliminar el formulario');
        }

        return {
            id,
            message: 'Formulario eliminado exitosamente'
        };
    } catch (error) {
        console.error('Error en deleteForm:', error);
        throw error;
    }
}; 