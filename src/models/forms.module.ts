import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/config.js';
import type { Form } from '../types/domain.js';

const getForms = async (): Promise<Form[]> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM forms');
    return result as unknown as Form[];
  } catch (error) {
    console.error('Error en getForms:', error);
    throw error;
  }
};

const getFormById = async (id: string): Promise<Form | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM forms WHERE id = ?', [id]);
    return result[0] as unknown as Form | undefined;
  } catch (error) {
    console.error('Error en getFormById:', error);
    throw error;
  }
};

const createForm = async (form: Record<string, unknown>): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO forms SET ?', [form]);
    return result;
  } catch (error) {
    console.error('Error en createForm:', error);
    throw error;
  }
};

const updateForm = async (
  id: string,
  form: Record<string, unknown>,
): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('UPDATE forms SET ? WHERE id = ?', [
      form,
      id,
    ]);
    return result;
  } catch (error) {
    console.error('Error en updateForm:', error);
    throw error;
  }
};

const deleteForm = async (id: string): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM forms WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Error en deleteForm:', error);
    throw error;
  }
};

const getFormByName = async (name: string): Promise<Form | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM forms WHERE name = ?', [
      name,
    ]);
    return result[0] as unknown as Form | undefined;
  } catch (error) {
    console.error('Error en getFormByName:', error);
    throw error;
  }
};

export class FormsModule {
  static getForms = getForms;
  static getFormById = getFormById;
  static createForm = createForm;
  static updateForm = updateForm;
  static deleteForm = deleteForm;
  static getFormByName = getFormByName;
}
