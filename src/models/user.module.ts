import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/config.js';
import type { User } from '../types/domain.js';

const getUsers = async (): Promise<User[]> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role_id FROM users',
    );
    return result as unknown as User[];
  } catch (error) {
    console.error('Error en getUsers:', error);
    throw error;
  }
};

const createUser = async (user: Record<string, unknown>): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO users SET ?', [user]);
    return result;
  } catch (error) {
    console.error('Error en createUser:', error);
    throw error;
  }
};

const updateUser = async (
  id: string,
  user: Record<string, unknown>,
): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('UPDATE users SET ? WHERE id = ?', [
      user,
      id,
    ]);
    return result;
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
};

const deleteUser = async (id: string): Promise<ResultSetHeader> => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Error en deleteUser:', error);
    throw error;
  }
};

const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role_id FROM users WHERE id = ?',
      [id],
    );
    return result[0] as unknown as User | undefined;
  } catch (error) {
    console.error('Error en getUserById:', error);
    throw error;
  }
};

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role_id FROM users WHERE email = ?',
      [email],
    );
    return result[0] as unknown as User | undefined;
  } catch (error) {
    console.error('Error en getUserByEmail:', error);
    throw error;
  }
};

const getUserByName = async (name: string): Promise<User | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role_id FROM users WHERE name = ?',
      [name],
    );
    return result[0] as unknown as User | undefined;
  } catch (error) {
    console.error('Error en getUserByName:', error);
    throw error;
  }
};

const getPasswordByUserId = async (id: string): Promise<{ password: string } | undefined> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT password FROM users WHERE id = ?',
      [id],
    );
    return result[0] as unknown as { password: string } | undefined;
  } catch (error) {
    console.error('Error en getPasswordByUserId:', error);
    throw error;
  }
};

export class UserModule {
  static getUsers = getUsers;
  static createUser = createUser;
  static updateUser = updateUser;
  static deleteUser = deleteUser;
  static getUserById = getUserById;
  static getUserByEmail = getUserByEmail;
  static getUserByName = getUserByName;
  static getPasswordByUserId = getPasswordByUserId;
}
