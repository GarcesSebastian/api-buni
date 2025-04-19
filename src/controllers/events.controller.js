import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../services/events.service.js';

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
        const eventId = await createEvent(req.body);
        res.status(201).json({ 
            message: 'Evento creado exitosamente',
            eventId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const UpdateEvent = async (req, res) => {
    try {
        await updateEvent(req.params.id, req.body);
        res.json({ message: 'Evento actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const DeleteEvent = async (req, res) => {
    try {
        await deleteEvent(req.params.id);
        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
