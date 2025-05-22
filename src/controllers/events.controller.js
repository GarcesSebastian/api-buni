import { getEvents, getEventById, createEvent, updateEvent, deleteEvent, updateEventForm, updateEventConfigForm } from '../services/events.service.js';

export const GetEvents = async (req, res) => {
    try {
        const events = await getEvents();
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const GetEventById = async (req, res) => {
    try {
        const event = await getEventById(req.params.id);
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const CreateEvent = async (req, res) => {
    try {
        const event = await createEvent(req.body);
        res.status(201).json({ 
            message: 'Evento creado exitosamente',
            data: event
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const UpdateEvent = async (req, res) => {
    try {
        const event = await updateEvent(req.params.id, req.body);
        res.json({ 
            message: 'Evento actualizado exitosamente',
            data: event
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const UpdateEventForm = async (req, res) => {
    try {
        const event = await updateEventForm(req.params.id, req.body);
        res.json({ 
            message: 'Formulario actualizado exitosamente',
            data: event
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const UpdateEventConfigForm = async (req, res) => {
    try {
        const event = await updateEventConfigForm(req.params.id, req.body);

        res.json({ 
            message: 'Configuración del formulario actualizada exitosamente',
            data: event
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const DeleteEvent = async (req, res) => {
    try {
        const event = await deleteEvent(req.params.id);
        res.json({ 
            message: 'Evento eliminado exitosamente',
            data: event
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
