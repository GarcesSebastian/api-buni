import type { Request, Response } from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../services/roles.service.js';
import type { Permissions } from '../types/domain.js';

export const GetCustomRoles = async (req: Request, res: Response) => {
  try {
    const roles = await getRoles();
    return res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return res.status(500).json({ error: (error as Error).message || 'Error al obtener los roles' });
  }
};

export const CreateCustomRole = async (req: Request, res: Response) => {
  try {
    const { name, permissions } = req.body as { name?: string; permissions?: unknown };

    if (!name || !permissions) {
      return res.status(400).json({ error: 'Se requieren nombre y permisos' });
    }

    let permissionsJson: unknown;
    try {
      permissionsJson = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
    } catch {
      return res.status(400).json({ error: 'Formato de permisos inválido' });
    }

    if (typeof permissionsJson !== 'object' || permissionsJson === null) {
      return res.status(400).json({ error: 'Los permisos deben ser un objeto' });
    }

    const role = await createRole(name, permissionsJson as Permissions);
    return res.status(201).json({
      message: 'Rol creado exitosamente',
      data: role,
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    if ((error as Error).message.includes('ya existe')) {
      return res.status(400).json({ error: (error as Error).message });
    }
    return res.status(500).json({ error: (error as Error).message || 'Error al crear el rol' });
  }
};

export const UpdateCustomRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body as { name?: string; permissions?: unknown };

    if (!name || !permissions) {
      return res.status(400).json({ error: 'Se requieren nombre y permisos' });
    }

    let permissionsJson: unknown;
    try {
      permissionsJson = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
    } catch {
      return res.status(400).json({ error: 'Formato de permisos inválido' });
    }

    if (typeof permissionsJson !== 'object' || permissionsJson === null) {
      return res.status(400).json({ error: 'Los permisos deben ser un objeto' });
    }

    const role = await updateRole(id as string, name, permissionsJson as Permissions);
    return res.json({
      message: 'Rol actualizado exitosamente',
      data: role,
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    const message = (error as Error).message;
    if (message.includes('no encontrado') || message.includes('ya existe')) {
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: message || 'Error al actualizar el rol' });
  }
};

export const DeleteCustomRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'El ID del rol es requerido' });
    }

    const result = await deleteRole(id);
    return res.json({
      message: 'Rol eliminado exitosamente',
      deletedRole: result,
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    const message = (error as Error).message;
    if (message.includes('no encontrado') || message.includes('utilizando')) {
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: message || 'Error al eliminar el rol' });
  }
};
