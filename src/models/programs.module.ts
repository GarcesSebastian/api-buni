import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/config.js';
import type { Program } from '../types/domain.js';

const getPrograms = async (): Promise<Program[]> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM programs');
    return result as unknown as Program[];
  } catch (error) {
    console.error('Error en getPrograms:', error);
    throw error;
  }
};

const getProgramById = async (id: string): Promise<Program | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM programs WHERE id = ?', [
      id,
    ]);
    return result[0] as unknown as Program | undefined;
  } catch (error) {
    console.error('Error en getProgramById:', error);
    throw error;
  }
};

const createProgram = async (program: Record<string, unknown>): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO programs SET ?', [program]);
    return result;
  } catch (error) {
    console.error('Error en createProgram:', error);
    throw error;
  }
};

const updateProgram = async (
  id: string,
  program: Record<string, unknown>,
): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('UPDATE programs SET ? WHERE id = ?', [
      program,
      id,
    ]);
    return result;
  } catch (error) {
    console.error('Error en updateProgram:', error);
    throw error;
  }
};

const deleteProgram = async (id: string): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM programs WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Error en deleteProgram:', error);
    throw error;
  }
};

const getProgramByName = async (name: string): Promise<Program | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM programs WHERE name = ?', [
      name,
    ]);
    return result[0] as unknown as Program | undefined;
  } catch (error) {
    console.error('Error en getProgramByName:', error);
    throw error;
  }
};

export class ProgramsModule {
  static getPrograms = getPrograms;
  static getProgramById = getProgramById;
  static createProgram = createProgram;
  static updateProgram = updateProgram;
  static deleteProgram = deleteProgram;
  static getProgramByName = getProgramByName;
}
