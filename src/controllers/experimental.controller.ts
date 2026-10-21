import type { Request, Response } from 'express';
import type { ResultSetHeader } from 'mysql2';
import { pool } from '../database/config.js';

export const deleteEvents = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM events');
    res.status(200).json({
      message: 'Eventos eliminados correctamente',
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Error en deleteEvents:', error);
    res.status(500).json({
      error: 'Error al eliminar los eventos',
      details: (error as Error).message,
    });
  }
};

export const deleteForms = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM forms');
    res.status(200).json({
      message: 'Formularios eliminados correctamente',
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Error en deleteForms:', error);
    res.status(500).json({
      error: 'Error al eliminar los formularios',
      details: (error as Error).message,
    });
  }
};

export const deleteUsers = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM users');
    res.status(200).json({
      message: 'Usuarios eliminados correctamente',
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Error en deleteUsers:', error);
    res.status(500).json({
      error: 'Error al eliminar los usuarios',
      details: (error as Error).message,
    });
  }
};

export const deleteRoles = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM roles');
    res.status(200).json({
      message: 'Roles eliminados correctamente',
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Error en deleteRoles:', error);
    res.status(500).json({
      error: 'Error al eliminar los roles',
      details: (error as Error).message,
    });
  }
};

export const deleteScenery = async (req: Request, res: Response) => {
  try {
    // Approved change (iv): fixed table name scenery -> sceneries (dev-only behavior change).
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM sceneries');
    res.status(200).json({
      message: 'Escenarios eliminados correctamente',
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Error en deleteScenery:', error);
    res.status(500).json({
      error: 'Error al eliminar los escenarios',
      details: (error as Error).message,
    });
  }
};

export const deletePrograms = async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM programs');
    res.status(200).json({
      message: 'Programas eliminados correctamente',
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Error en deletePrograms:', error);
    res.status(500).json({
      error: 'Error al eliminar los programas',
      details: (error as Error).message,
    });
  }
};

export const deleteAll = async (req: Request, res: Response) => {
  try {
    const results = await Promise.all([
      pool.query<ResultSetHeader>('DELETE FROM events'),
      pool.query<ResultSetHeader>('DELETE FROM forms'),
      pool.query<ResultSetHeader>('DELETE FROM users'),
      pool.query<ResultSetHeader>('DELETE FROM roles'),
      pool.query<ResultSetHeader>('DELETE FROM sceneries'),
      pool.query<ResultSetHeader>('DELETE FROM programs'),
    ]);

    const summary = {
      events: results[0][0].affectedRows,
      forms: results[1][0].affectedRows,
      users: results[2][0].affectedRows,
      roles: results[3][0].affectedRows,
      scenery: results[4][0].affectedRows,
      programs: results[5][0].affectedRows,
    };

    res.status(200).json({
      message: 'Todos los datos eliminados correctamente',
      summary,
    });
  } catch (error) {
    console.error('Error en deleteAll:', error);
    res.status(500).json({
      error: 'Error al eliminar los datos',
      details: (error as Error).message,
    });
  }
};
