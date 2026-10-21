import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/config.js';
import type { EventRecord } from '../types/domain.js';

const getEvents = async (): Promise<EventRecord[]> => {
  try {
    const [events] = await pool.query<RowDataPacket[]>(`
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
    return events as unknown as EventRecord[];
  } catch (error) {
    console.error('Error en getEvents:', error);
    throw error;
  }
};

const getEventById = async (id: string): Promise<EventRecord | undefined> => {
  try {
    const [event] = await pool.query<RowDataPacket[]>(
      `
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
    `,
      [id],
    );
    return event[0] as unknown as EventRecord | undefined;
  } catch (error) {
    console.error('Error en getEventById:', error);
    throw error;
  }
};

const getEventConfigFormById = async (id: string): Promise<RowDataPacket | undefined> => {
  try {
    const [event] = await pool.query<RowDataPacket[]>(
      `
            SELECT 
                id, 
                formConfig
            FROM events
            WHERE id = ?
        `,
      [id],
    );
    return event[0];
  } catch (error) {
    console.error('Error en getEventConfigFormById:', error);
    throw error;
  }
};

const createEvent = async (event: Record<string, unknown>): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO events SET ?', [event]);
    return result;
  } catch (error) {
    console.error('Error en createEvent:', error);
    throw error;
  }
};

const updateEvent = async (
  id: string,
  event: Record<string, unknown>,
): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('UPDATE events SET ? WHERE id = ?', [
      event,
      id,
    ]);
    return result;
  } catch (error) {
    console.error('Error en updateEvent:', error);
    throw error;
  }
};

const updateEventForm = async (
  id: string,
  formData: { inscriptions: string; assists: string },
): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE events SET inscriptions = ?, assists = ? WHERE id = ?',
      [formData.inscriptions, formData.assists, id],
    );
    return result;
  } catch (error) {
    console.error('Error en updateEventForm:', error);
    throw error;
  }
};

const updateEventConfigForm = async (id: string, configForm: string): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE events SET formConfig = ? WHERE id = ?',
      [configForm, id],
    );
    return result;
  } catch (error) {
    console.error('Error en updateEventConfigForm:', error);
    throw error;
  }
};

const deleteEvent = async (id: string): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM events WHERE id = ?', [id]);
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
