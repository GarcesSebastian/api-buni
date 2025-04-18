import { pool } from '../database/config.js';

export const GetSceneries = async (req, res) => {
    try {
        const [sceneries] = await pool.query('SELECT id, name, state FROM Scenery');
        res.json(sceneries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los escenarios' });
    }
};

export const CreateScenery = async (req, res) => {
    try {
        const { name, state } = req.body;

        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const [existingScenery] = await pool.query('SELECT * FROM Scenery WHERE name = ?', [name]);
        if (existingScenery.length > 0) {
            return res.status(400).json({ error: 'El escenario ya existe' });
        }

        const [result] = await pool.query(
            'INSERT INTO Scenery (name, state) VALUES (?, ?)',
            [name, state]
        );

        res.status(201).json({ 
            message: 'Escenario creado exitosamente',
            id: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el escenario' });
    }
};

export const UpdateScenery = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, state } = req.body;

        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const [result] = await pool.query(
            'UPDATE Scenery SET name = ?, state = ? WHERE id = ?',
            [name, state, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Escenario no encontrado' });
        }

        res.json({ message: 'Escenario actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el escenario' });
    }
};

export const DeleteScenery = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM Scenery WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Escenario no encontrado' });
        }

        res.json({ message: 'Escenario eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el escenario' });
    }
}; 