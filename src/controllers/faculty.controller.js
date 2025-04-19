import { getFaculties, getFacultyById, createFaculty, updateFaculty, deleteFaculty } from '../services/faculty.service.js';

export const GetFaculties = async (req, res) => {
    try {
        const faculties = await getFaculties();
        res.json(faculties);
    } catch (error) {
        console.error('Error al obtener facultades:', error);
        res.status(500).json({ error: error.message || 'Error al obtener las facultades' });
    }
};

export const GetFacultyById = async (req, res) => {
    try {
        const faculty = await getFacultyById(req.params.id);
        res.json(faculty);
    } catch (error) {
        console.error('Error al obtener facultad:', error);
        res.status(500).json({ error: error.message || 'Error al obtener la facultad' });
    }
};

export const CreateFaculty = async (req, res) => {
    try {
        const { name, state } = req.body;
        
        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const faculty = await createFaculty(name, state);
        res.status(201).json(faculty);
    } catch (error) {
        console.error('Error al crear facultad:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al crear la facultad' });
    }
};

export const UpdateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, state } = req.body;

        if (!name || !state) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const faculty = await updateFaculty(id, name, state);
        res.json(faculty);
    } catch (error) {
        console.error('Error al actualizar facultad:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrada')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al actualizar la facultad' });
    }
};

export const DeleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID de la facultad es requerido' });
        }

        const result = await deleteFaculty(id);
        res.json(result);
    } catch (error) {
        console.error('Error al eliminar facultad:', error);
        if (error.message.includes('no encontrada')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Error al eliminar la facultad' });
    }
}; 