import { pool } from '../database/config.js';

const getEvents = async () => {
    try {
        const [events] = await pool.query(`
            SELECT 
                id, 
                nombre, 
                organizador, 
                scenery, 
            programs, 
            cupos, 
            DATE_FORMAT(horarioInicio, '%Y-%m-%dT%H:%i:%s.000Z') as horarioInicio,
            DATE_FORMAT(horarioFin, '%Y-%m-%dT%H:%i:%s.000Z') as horarioFin,
            state, 
            formAssists, 
            formInscriptions, 
            assists, 
            inscriptions,
            formConfig 
        FROM events
    `);
        return events;
    } catch (error) {
        console.error('Error en getEvents:', error);
        throw error;
    }
};

const getEventById = async (id) => {
    try {
        const [event] = await pool.query(`
            SELECT 
                id, 
                nombre, 
                organizador, 
                scenery, 
                programs, 
            cupos, 
            DATE_FORMAT(horarioInicio, '%Y-%m-%dT%H:%i:%s.000Z') as horarioInicio,
            DATE_FORMAT(horarioFin, '%Y-%m-%dT%H:%i:%s.000Z') as horarioFin,
            state, 
            formAssists, 
            formInscriptions, 
            assists, 
            inscriptions,
            formConfig
        FROM events
        WHERE id = ?
    `, [id]);
        return event[0];
    } catch (error) {
        console.error('Error en getEventById:', error);
        throw error;
    }
};

const getEventConfigFormById = async (id) => {
    try {
        const [event] = await pool.query(`
            SELECT 
                id, 
                formConfig
            FROM events
            WHERE id = ?
        `, [id]);
        return event[0];
    } catch (error) {
        console.error('Error en getEventConfigFormById:', error);
        throw error;
    }
};

const createEvent = async (event) => {
    try {
        const [result] = await pool.query('INSERT INTO events SET ?', [event]);
        return result;
    } catch (error) {
        console.error('Error en createEvent:', error);
        throw error;
    }
};

const updateEvent = async (id, event) => {
    try {
        const [result] = await pool.query('UPDATE events SET ? WHERE id = ?', [event, id]);
        return result;
    } catch (error) {
        console.error('Error en updateEvent:', error);
        throw error;
    }
};

const updateEventForm = async (id, formData) => {
    try {
        const [result] = await pool.query('UPDATE events SET inscriptions = ?, assists = ? WHERE id = ?', [formData.inscriptions, formData.assists, id]);
        return result;
    } catch (error) {
        console.error('Error en updateEventForm:', error);
        throw error;
    }
};

const updateEventConfigForm = async (id, configForm) => {
    try {
        const [result] = await pool.query('UPDATE events SET formConfig = ? WHERE id = ?', [configForm, id]);
        return result;
    } catch (error) {
        console.error('Error en updateEventConfigForm:', error);
        throw error;
    }
};

const deleteEvent = async (id) => {
    try {
        const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
        return result;
    } catch (error) {
        console.error('Error en deleteEvent:', error);
        throw error;
    }
};

export class EventsModule {
    static getEvents = getEvents;
    static getEventById = getEventById;
    static getEventConfigFormById = getEventConfigFormById;
    static createEvent = createEvent;
    static updateEvent = updateEvent;
    static deleteEvent = deleteEvent;
    static updateEventForm = updateEventForm;
    static updateEventConfigForm = updateEventConfigForm;
}