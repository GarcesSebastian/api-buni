import { pool } from '../database/config.js';

export const GetEvents = async (req, res) => {
    try {
        const [events] = await pool.query('SELECT * FROM events');
        const parsedEvents = events.map(event => {
            const { created_at, ...eventData } = event;
            return {
                ...eventData,
                fecha: event.fecha.toISOString().split('T')[0],
                hora: event.hora.slice(0, 5),
                scenery: JSON.parse(event.scenery),
                faculty: JSON.parse(event.faculty),
                formAssists: JSON.parse(event.formAssists),
                formInscriptions: JSON.parse(event.formInscriptions),
                assists: JSON.parse(event.assists),
                inscriptions: JSON.parse(event.inscriptions)
            };
        });
        res.json(parsedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los eventos' });
    }
};

export const CreateEvent = async (req, res) => {
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
        } = req.body;

        if (!nombre || !organizador || !scenery || !faculty || !cupos || !fecha || !hora || state === undefined) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
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

        res.status(201).json({ 
            message: 'Evento creado exitosamente',
            eventId: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el evento' });
    }
};

export const UpdateEvent = async (req, res) => {
    try {
        const { id } = req.params;
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
        } = req.body;

        if (!nombre || !organizador || !scenery || !faculty || !cupos || !fecha || !hora || state === undefined) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
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
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json({ message: 'Evento actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el evento' });
    }
};

export const DeleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el evento' });
    }
};
