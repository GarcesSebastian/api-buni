import { getForms, getFormById, createForm, updateForm, deleteForm, getFormData } from '../services/forms.service.js';

export const GetForms = async (req, res) => {
    try {
        const forms = await getForms();
        
        res.json(forms);
    } catch (error) {
        console.error('Error en GetForms:', error);
        res.status(500).json({ error: error.message });
    }
};

export const GetFormData = async (req, res) => {
    try {
        const formData = await getFormData(req.params.id, req.params.type);

        res.json(formData);
    } catch (error) {
        console.error('Error en GetFormData:', error);
        res.status(500).json({ error: error.message });
    }
};

export const GetFormById = async (req, res) => {
    try {
        const { id } = req.params;
        const form = await getFormById(id);

        res.json({
            message: 'Formulario obtenido exitosamente',
            data: form
        });
    } catch (error) {
        console.error('Error en GetFormById:', error);
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const CreateForm = async (req, res) => {
    try {
        const form = await createForm(req.body);

        res.status(201).json({
            message: 'Formulario creado exitosamente',
            data: form
        });
    } catch (error) {
        console.error('Error en CreateForm:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const UpdateForm = async (req, res) => {
    try {
        const { id } = req.params;
        const form = await updateForm(id, req.body);

        res.json({
            message: 'Formulario actualizado exitosamente',
            data: form
        });
    } catch (error) {
        console.error('Error en UpdateForm:', error);
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ error: error.message });
        } else if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const DeleteForm = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteForm(id);

        res.json({
            message: 'Formulario eliminado exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error en DeleteForm:', error);
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};