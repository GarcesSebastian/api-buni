import { getPrograms, getProgramById, createProgram, updateProgram, deleteProgram } from '../services/programs.service.js';

export const GetPrograms = async (req, res) => {
    try {
        const programs = await getPrograms();
        res.json(programs);
    } catch (error) {
        console.error('Error al obtener programas:', error);
        res.status(500).json({ error: error.message || 'Error al obtener los programas' });
    }
};

export const GetProgramById = async (req, res) => {
    try {
        const program = await getProgramById(req.params.id);
        res.json(program);
    } catch (error) {
        console.error('Error al obtener programa:', error);
        res.status(500).json({ error: error.message || 'Error al obtener el programa' });
    }
};

export const CreateProgram = async (req, res) => {
    try {
        const { name, state } = req.body;
        
        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const program = await createProgram(name, state);
        res.status(201).json(program);
    } catch (error) {
        console.error('Error al crear programa:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al crear el programa' });
    }
};

export const UpdateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, state } = req.body;

        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const program = await updateProgram(id, name, state);
        res.json(program);
    } catch (error) {
        console.error('Error al actualizar programa:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrada')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al actualizar el programa' });
    }
};

export const DeleteProgram = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID del programa es requerido' });
        }

        const result = await deleteProgram(id);
        res.json(result);
    } catch (error) {
        console.error('Error al eliminar programa:', error);
        if (error.message.includes('no encontrada')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al eliminar el programa' });
    }
}; 