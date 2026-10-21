import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/config.js';
import type { Scenery } from '../types/domain.js';

const getSceneries = async (): Promise<Scenery[]> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM sceneries');
    return result as unknown as Scenery[];
  } catch (error) {
    console.error('Error en getSceneries:', error);
    throw error;
  }
};

const getSceneryById = async (id: string): Promise<Scenery | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM sceneries WHERE id = ?', [
      id,
    ]);
    return result[0] as unknown as Scenery | undefined;
  } catch (error) {
    console.error('Error en getSceneryById:', error);
    throw error;
  }
};

const createScenery = async (scenery: Record<string, unknown>): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO sceneries SET ?', [scenery]);
    return result;
  } catch (error) {
    console.error('Error en createScenery:', error);
    throw error;
  }
};

const updateScenery = async (
  id: string,
  scenery: Record<string, unknown>,
): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('UPDATE sceneries SET ? WHERE id = ?', [
      scenery,
      id,
    ]);
    return result;
  } catch (error) {
    console.error('Error en updateScenery:', error);
    throw error;
  }
};

const deleteScenery = async (id: string): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM sceneries WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Error en deleteScenery:', error);
    throw error;
  }
};

const getSceneryByName = async (name: string): Promise<Scenery | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM sceneries WHERE name = ?', [
      name,
    ]);
    return result[0] as unknown as Scenery | undefined;
  } catch (error) {
    console.error('Error en getSceneryByName:', error);
    throw error;
  }
};

export class SceneryModule {
  static getSceneries = getSceneries;
  static getSceneryById = getSceneryById;
  static createScenery = createScenery;
  static updateScenery = updateScenery;
  static deleteScenery = deleteScenery;
  static getSceneryByName = getSceneryByName;
}
