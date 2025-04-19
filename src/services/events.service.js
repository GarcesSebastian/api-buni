import { pool } from '../database/config.js';

export const getEvents = async () => {
    try {
        const [events] = await pool.query('SELECT * FROM events');
        return events.map(event => {
            const { created_at, ...eventData } = event;
            return {
                ...eventData,
                fecha: event.fecha.toISOString().split('T')[0],
                hora: event.hora.slice(0, 5),
                scenery: typeof event.scenery === 'string' ? JSON.parse(event.scenery) : event.scenery,
                faculty: typeof event.faculty === 'string' ? JSON.parse(event.faculty) : event.faculty,
                formAssists: typeof event.formAssists === 'string' ? JSON.parse(event.formAssists) : event.formAssists,
                formInscriptions: typeof event.formInscriptions === 'string' ? JSON.parse(event.formInscriptions) : event.formInscriptions,
                assists: typeof event.assists === 'string' ? JSON.parse(event.assists) : event.assists,
                inscriptions: typeof event.inscriptions === 'string' ? JSON.parse(event.inscriptions) : event.inscriptions
            };
        });
    } catch (error) {
        console.error('Error en getEvents:', error);
        throw new Error('Error al obtener los eventos de la base de datos');
    }
};

export const getEventById = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del evento es requerido');
        }

        const [event] = await pool.query(
            'SELECT id, nombre, organizador, scenery, faculty, cupos, fecha, hora, state, formAssists, formInscriptions, assists, inscriptions FROM events WHERE id = ?', 
            [id]
        );

        if (event.length === 0) {
            throw new Error('Evento no encontrado');
        }

        const eventData = event[0];
        return {
            ...eventData,
            fecha: eventData.fecha.toISOString().split('T')[0],
            hora: eventData.hora.slice(0, 5),
            scenery: typeof eventData.scenery === 'string' ? JSON.parse(eventData.scenery) : eventData.scenery,
            faculty: typeof eventData.faculty === 'string' ? JSON.parse(eventData.faculty) : eventData.faculty,
            formAssists: typeof eventData.formAssists === 'string' ? JSON.parse(eventData.formAssists) : eventData.formAssists,
            formInscriptions: typeof eventData.formInscriptions === 'string' ? JSON.parse(eventData.formInscriptions) : eventData.formInscriptions,
            assists: typeof eventData.assists === 'string' ? JSON.parse(eventData.assists) : eventData.assists,
            inscriptions: typeof eventData.inscriptions === 'string' ? JSON.parse(eventData.inscriptions) : eventData.inscriptions
        };
    } catch (error) {
        console.error('Error en getEventById:', error);
        if (error.message.includes('requerido') || error.message.includes('no encontrado')) {
            throw error;
        }
        throw new Error('Error al obtener el evento de la base de datos');
    }
};

export const createEvent = async (eventData) => {
    try {
        const {
            nombre,
            organizador,
            scenery,
            faculty,
            cupos,
            fecha,
            hora,
            state,
            formAssists,
            formInscriptions,
            assists,
            inscriptions
        } = eventData;

        if (!nombre || !organizador || !scenery || !faculty || !cupos || !fecha || !hora || state === undefined) {
            throw new Error('Todos los campos son requeridos');
        }

        const [result] = await pool.query(
            'INSERT INTO events (nombre, organizador, scenery, faculty, cupos, fecha, hora, state, formAssists, formInscriptions, assists, inscriptions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                nombre,
                organizador,
                JSON.stringify(scenery),
                JSON.stringify(faculty),
                cupos,
                fecha,
                hora,
                state,
                JSON.stringify(formAssists),
                JSON.stringify(formInscriptions),
                JSON.stringify(assists),
                JSON.stringify(inscriptions)
            ]
        );

        return result.insertId;
    } catch (error) {
        console.error('Error en createEvent:', error);
        if (error.message.includes('requeridos')) {
            throw error;
        }
        throw new Error('Error al crear el evento en la base de datos');
    }
};

export const updateEvent = async (id, eventData) => {
    try {
        const {
            nombre,
            organizador,
            scenery,
            faculty,
            cupos,
            fecha,
            hora,
            state,
            formAssists,
            formInscriptions,
            assists,
            inscriptions
        } = eventData;

        if (!nombre || !organizador || !scenery || !faculty || !cupos || !fecha || !hora || state === undefined) {
            throw new Error('Todos los campos son requeridos');
        }

        const [result] = await pool.query(
            'UPDATE events SET nombre = ?, organizador = ?, scenery = ?, faculty = ?, cupos = ?, fecha = ?, hora = ?, state = ?, formAssists = ?, formInscriptions = ?, assists = ?, inscriptions = ? WHERE id = ?',
            [
                nombre,
                organizador,
                JSON.stringify(scenery),
                JSON.stringify(faculty),
                cupos,
                fecha,
                hora,
                state,
                JSON.stringify(formAssists),
                JSON.stringify(formInscriptions),
                JSON.stringify(assists),
                JSON.stringify(inscriptions),
                id
            ]
        );

        if (result.affectedRows === 0) {
            throw new Error('Evento no encontrado');
        }

        return true;
    } catch (error) {
        console.error('Error en updateEvent:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrado')) {
            throw error;
        }
        throw new Error('Error al actualizar el evento en la base de datos');
    }
};

export const deleteEvent = async (id) => {
    try {
        const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('Evento no encontrado');
        }

        return true;
    } catch (error) {
        console.error('Error en deleteEvent:', error);
        if (error.message.includes('no encontrado')) {
            throw error;
        }
        throw new Error('Error al eliminar el evento de la base de datos');
    }
};