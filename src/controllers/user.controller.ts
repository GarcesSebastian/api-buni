import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  recoveryPassword,
  verifyRecoveryPassword,
  changePassword,
} from '../services/user.service.js';
import { getEvents } from '../services/events.service.js';
import { getPrograms } from '../services/programs.service.js';
import { getSceneries } from '../services/scenery.service.js';
import { getForms } from '../services/forms.service.js';
import { pool } from '../database/config.js';
import { parseJsonColumn } from '../lib/parseJsonColumn.js';

export const GetUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const GetUserData = async (req: Request, res: Response) => {
  try {
    // Parallelized (design §4.4): the 6 sequential awaits become a single Promise.all; shape identical.
    const [rolesResult, events, programs, scenery, users, forms] = await Promise.all([
      pool.query<RowDataPacket[]>('SELECT id, name, permissions FROM roles'),
      getEvents(),
      getPrograms(),
      getSceneries(),
      getUsers(),
      getForms(),
    ]);
    const [roles] = rolesResult;

    const userData = {
      events,
      programs,
      scenery,
      users,
      forms,
      roles: roles.map((role) => ({
        ...role,
        permissions: parseJsonColumn(role.permissions),
      })),
    };

    return res.json(userData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const CreateUser = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const UpdateUser = async (req: Request, res: Response) => {
  try {
    const user = await updateUser(req.params.id as string, req.body);

    return res.json({
      message: 'Usuario actualizado exitosamente',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const RecoveryPassword = async (req: Request, res: Response) => {
  try {
    const user = await recoveryPassword(req.params.id as string);

    return res.json({
      message: 'Código de recuperación enviado exitosamente',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const VerifyRecoveryPassword = async (req: Request, res: Response) => {
  try {
    const user = await verifyRecoveryPassword(req.params.id as string, req.body.code);

    return res.json({
      message: 'Código de recuperación verificado exitosamente',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const ChangePassword = async (req: Request, res: Response) => {
  try {
    const user = await changePassword(req.params.id as string, req.body.password);

    return res.json({
      message: 'Contraseña cambiada exitosamente',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const DeleteUser = async (req: Request, res: Response) => {
  try {
    const user = await deleteUser(req.params.id as string);

    return res.json({
      message: 'Usuario eliminado exitosamente',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};
