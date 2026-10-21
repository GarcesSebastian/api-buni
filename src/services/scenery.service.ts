import { SceneryModule } from '../models/scenery.module.js';
import { Utils } from '../lib/Utils.js';
import type { Scenery } from '../types/domain.js';

export const getSceneries = async (): Promise<Scenery[]> => {
  try {
    const scenery = await SceneryModule.getSceneries();
    return scenery;
  } catch (error) {
    console.error('Error en getSceneries:', error);
    throw new Error('Error al obtener los escenarios de la base de datos');
  }
};

export const getSceneryById = async (id: string): Promise<Scenery> => {
  try {
    const scenery = await SceneryModule.getSceneryById(id);

    if (!scenery) {
      throw new Error('Escenario no encontrado');
    }

    return scenery;
  } catch (error) {
    console.error('Error en getSceneryById:', error);
    throw new Error('Error al obtener el escenario de la base de datos');
  }
};

export const createScenery = async (name: string, state: string): Promise<Record<string, unknown>> => {
  try {
    if (!name || !state) {
      throw new Error('El nombre y el estado son requeridos');
    }

    const existingScenery = await SceneryModule.getSceneryByName(name);
    if (existingScenery) {
      throw new Error('Ya existe un escenario con ese nombre');
    }

    const payload = {
      id: Utils.generateUUID(),
      name,
      state,
    };

    await SceneryModule.createScenery(payload);

    return {
      ...payload,
    };
  } catch (error) {
    console.error('Error en createScenery:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('ya existe')) {
      throw error;
    }
    throw new Error('Error al crear el escenario en la base de datos');
  }
};

export const updateScenery = async (
  id: string,
  name: string,
  state: string,
): Promise<boolean> => {
  try {
    if (!id || !name || !state) {
      throw new Error('El ID, nombre y estado son requeridos');
    }

    const existingScenery = await SceneryModule.getSceneryById(id);
    if (!existingScenery) {
      throw new Error('Escenario no encontrado');
    }

    const result = await SceneryModule.updateScenery(id, { name, state });

    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el escenario');
    }

    return true;
  } catch (error) {
    console.error('Error en updateScenery:', error);
    const message = (error as Error).message;
    if (
      message.includes('requeridos') ||
      message.includes('no encontrado') ||
      message.includes('actualizar')
    ) {
      throw error;
    }
    throw new Error('Error al actualizar el escenario en la base de datos');
  }
};

export const deleteScenery = async (id: string): Promise<boolean> => {
  try {
    if (!id) {
      throw new Error('El ID del escenario es requerido');
    }

    const existingScenery = await SceneryModule.getSceneryById(id);
    if (!existingScenery) {
      throw new Error('Escenario no encontrado');
    }

    const result = await SceneryModule.deleteScenery(id);

    if (result.affectedRows === 0) {
      throw new Error('No se pudo eliminar el escenario');
    }

    return true;
  } catch (error) {
    console.error('Error en deleteScenery:', error);
    const message = (error as Error).message;
    if (
      message.includes('requerido') ||
      message.includes('no encontrado') ||
      message.includes('eliminar')
    ) {
      throw error;
    }
    throw new Error('Error al eliminar el escenario de la base de datos');
  }
};
