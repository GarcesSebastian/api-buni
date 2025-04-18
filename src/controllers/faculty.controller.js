import { pool } from '../database/config.js';

export const GetFaculties = async (req, res) => {
    try {
        const [faculties] = await pool.query('SELECT id, name, state FROM faculty');
        res.json(faculties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las facultades' });
    }
};

export const CreateFaculty = async (req, res) => {
    try {
        const { name, state } = req.body;

        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const [existingFaculty] = await pool.query('SELECT * FROM faculty WHERE name = ?', [name]);
        if (existingFaculty.length > 0) {
            return res.status(400).json({ error: 'La facultad ya existe' });
        }

        const [result] = await pool.query(
            'INSERT INTO faculty (name, state) VALUES (?, ?)',
            [name, state]
        );

        res.status(201).json({ 
            message: 'Facultad creada exitosamente',
            id: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la facultad' });
    }
};

export const UpdateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, state } = req.body;

        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const [result] = await pool.query(
            'UPDATE faculty SET name = ?, state = ? WHERE id = ?',
            [name, state, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Facultad no encontrada' });
        }

        res.json({ message: 'Facultad actualizada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la facultad' });
    }
};

export const DeleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM faculty WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Facultad no encontrada' });
        }

        res.json({ message: 'Facultad eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la facultad' });
    }
}; 