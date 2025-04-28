import { SceneryModule } from '../models/scenery.module.js';
import { Utils } from '../lib/Utils.js';

export const getSceneries = async () => {
    try {
        const scenery = await SceneryModule.getSceneries();
        return scenery;
    } catch (error) {
        console.error('Error en getSceneries:', error);
        throw new Error('Error al obtener los escenarios de la base de datos');
    }
};

export const getSceneryById = async (id) => {
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

export const createScenery = async (name, state) => {
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
            state
        }

        const result = await SceneryModule.createScenery(payload);

        return {
            id: payload.id,
            ...payload
        };
    } catch (error) {
        console.error('Error en createScenery:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            throw error;
        }
        throw new Error('Error al crear el escenario en la base de datos');
    }
};

export const updateScenery = async (id, name, state) => {
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
        if (error.message.includes('requeridos') || error.message.includes('no encontrado') || error.message.includes('actualizar')) {
            throw error;
        }
        throw new Error('Error al actualizar el escenario en la base de datos');
    }
};

export const deleteScenery = async (id) => {
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
        if (error.message.includes('requerido') || error.message.includes('no encontrado') || error.message.includes('eliminar')) {
            throw error;
        }
        throw new Error('Error al eliminar el escenario de la base de datos');
    }
}; 