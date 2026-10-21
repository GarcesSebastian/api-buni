import { RoleModule } from '../models/roles.module.js';
import { Utils } from '../lib/Utils.js';
import { parseJsonColumn } from '../lib/parseJsonColumn.js';
import type { Permissions } from '../types/domain.js';

type AnyRecord = Record<string, unknown>;

export const getRoles = async (): Promise<AnyRecord[]> => {
  try {
    const roles = await RoleModule.getRoles();
    return roles.map((role) => ({
      ...role,
      permissions: parseJsonColumn(role.permissions),
    }));
  } catch (error) {
    console.error('Error en getRoles:', error);
    throw error;
  }
};

export const createRole = async (name: string, permissions: Permissions): Promise<AnyRecord> => {
  try {
    if (!name || !permissions) {
      throw new Error('El nombre y los permisos son requeridos');
    }

    const existingRole = await RoleModule.getRoleByName(name);
    if (existingRole) {
      throw new Error('Ya existe un rol con ese nombre');
    }

    const payload = {
      id: Utils.generateUUID(),
      name,
      permissions: JSON.stringify(permissions),
    };

    const result = await RoleModule.createRole(payload);

    if (result.affectedRows === 0) {
      throw new Error('Rol no creado');
    }

    return {
      ...payload,
      permissions: parseJsonColumn(payload.permissions),
    };
  } catch (error) {
    console.error('Error en createRole:', error);
    throw error;
  }
};

export const updateRole = async (
  id: string,
  name: string,
  permissions: Permissions,
): Promise<boolean> => {
  try {
    if (!id || !name || !permissions) {
      throw new Error('El ID, nombre y permisos son requeridos');
    }

    const existingRole = await RoleModule.getRoleById(id);
    if (!existingRole) {
      throw new Error('Rol no encontrado');
    }

    const isSameName = existingRole.name === name;
    const existingName = await RoleModule.getRoleByName(name);

    if (existingName && !isSameName) {
      throw new Error('Ya existe un rol con ese nombre');
    }

    const result = await RoleModule.updateRole(id, {
      name,
      permissions: JSON.stringify(permissions),
    });

    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el rol');
    }

    return true;
  } catch (error) {
    console.error('Error en updateRole:', error);
    throw error;
  }
};

export const deleteRole = async (id: string): Promise<boolean> => {
  try {
    if (!id) {
      throw new Error('El ID del rol es requerido');
    }

    const existingRole = await RoleModule.getRoleById(id);
    if (!existingRole) {
      throw new Error('Rol no encontrado');
    }

    const usersWithRole = await RoleModule.getUsersWithRole(id);

    if (usersWithRole > 0) {
      throw new Error('No se puede eliminar el rol porque hay usuarios que lo están utilizando');
    }

    const result = await RoleModule.deleteRole(id);

    if (result.affectedRows === 0) {
      throw new Error('No se pudo eliminar el rol');
    }

    return true;
  } catch (error) {
    console.error('Error en deleteRole:', error);
    throw error;
  }
};
