import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/config.js';
import type { Role } from '../types/domain.js';

const getRoles = async (): Promise<Role[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM roles');
    return rows as unknown as Role[];
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    throw error;
  }
};

const getRoleById = async (id: string): Promise<Role | undefined> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM roles WHERE id = ?', [id]);
    return rows[0] as unknown as Role | undefined;
  } catch (error) {
    console.error('Error al obtener el rol por ID:', error);
    throw error;
  }
};

const createRole = async (role: Record<string, unknown>): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO roles SET ?', [role]);
    return result;
  } catch (error) {
    console.error('Error al crear el rol:', error);
    throw error;
  }
};

const updateRole = async (
  id: string,
  role: Record<string, unknown>,
): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('UPDATE roles SET ? WHERE id = ?', [
      role,
      id,
    ]);
    return result;
  } catch (error) {
    console.error('Error al actualizar el rol:', error);
    throw error;
  }
};

const deleteRole = async (id: string): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM roles WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Error al eliminar el rol:', error);
    throw error;
  }
};

const getUsersWithRole = async (id: string): Promise<number> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [id],
    );
    return (rows[0]?.count as number) ?? 0;
  } catch (error) {
    console.error('Error al obtener los usuarios con el rol:', error);
    throw error;
  }
};

const getRoleByName = async (name: string): Promise<Role | undefined> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM roles WHERE name = ?', [name]);
    return rows[0] as unknown as Role | undefined;
  } catch (error) {
    console.error('Error al obtener el rol por nombre:', error);
    throw error;
  }
};

export class RoleModule {
  static getRoles = getRoles;
  static getRoleById = getRoleById;
  static createRole = createRole;
  static updateRole = updateRole;
  static deleteRole = deleteRole;
  static getUsersWithRole = getUsersWithRole;
  static getRoleByName = getRoleByName;
}
