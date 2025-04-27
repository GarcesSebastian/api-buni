import { getSceneries, getSceneryById, createScenery, updateScenery, deleteScenery } from '../services/scenery.service.js';

export const GetSceneries = async (req, res) => {
    try {
        const sceneries = await getSceneries();
        res.json(sceneries);
    } catch (error) {
        console.error('Error al obtener escenarios:', error);
        res.status(500).json({ error: error.message || 'Error al obtener los escenarios' });
    }
};

export const GetSceneryById = async (req, res) => {
    try {
        const scenery = await getSceneryById(req.params.id);
        res.json(scenery);
    } catch (error) {
        console.error('Error al obtener escenario:', error);
        res.status(500).json({ error: error.message || 'Error al obtener el escenario' });
    }
};


export const CreateScenery = async (req, res) => {
    try {
        const { name, state } = req.body;
        
        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const scenery = await createScenery(name, state);
        res.status(201).json({
            message: 'Escenario creado exitosamente',
            data: scenery
        });
    } catch (error) {
        console.error('Error al crear escenario:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al crear el escenario' });
    }
};

export const UpdateScenery = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, state } = req.body;

        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const scenery = await updateScenery(id, name, state);
        res.json({
            message: 'Escenario actualizado exitosamente',
            data: scenery
        });
    } catch (error) {
        console.error('Error al actualizar escenario:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrado')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al actualizar el escenario' });
    }
};

export const DeleteScenery = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID del escenario es requerido' });
        }

        const result = await deleteScenery(id);
        res.json({
            message: 'Escenario eliminado exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error al eliminar escenario:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al eliminar el escenario' });
    }
}; 