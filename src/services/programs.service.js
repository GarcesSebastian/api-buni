import { ProgramsModule } from '../models/programs.module.js';
import { Utils } from '../lib/Utils.js';

export const getPrograms = async () => {
    try {
        const programs = await ProgramsModule.getPrograms();
        return programs;
    } catch (error) {
        console.error('Error en getPrograms:', error);
        throw new Error('Error al obtener los programas de la base de datos');
    }
};

export const getProgramById = async (id) => {
    try {
        const program = await ProgramsModule.getProgramById(id);

        if (!program) {
            throw new Error('Programa no encontrado');
        }

        return program;
    } catch (error) {
        console.error('Error en getProgramById:', error);
        throw new Error('Error al obtener el programa de la base de datos');
    }
};

export const createProgram = async (name, state) => {
    try {
        if (!name || !state) {
            throw new Error('El nombre y el estado son requeridos');
        }

        const existingProgram = await ProgramsModule.getProgramByName(name);
        if (existingProgram) {
            throw new Error('Ya existe un programa con ese nombre');
        }

        const payload = {
            id: Utils.generateUUID(),
            name,
            state
        }

        const result = await ProgramsModule.createProgram(payload);

        return {
            id: payload.id,
            ...payload
        };
    } catch (error) {
        console.error('Error en createProgram:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            throw error;
        }
        throw new Error('Error al crear el programa en la base de datos');
    }
};

export const updateProgram = async (id, name, state) => {
    try {
        if (!id || !name || !state) {
            throw new Error('El ID, nombre y estado son requeridos');
        }

        const existingProgram = await ProgramsModule.getProgramById(id);
        if (!existingProgram) {
            throw new Error('Programa no encontrado');
        }

        const result = await ProgramsModule.updateProgram(id, { name, state });

        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar el programa');
        }

        return true;
    } catch (error) {
        console.error('Error en updateProgram:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrada') || error.message.includes('actualizar')) {
            throw error;
        }
        throw new Error('Error al actualizar el programa en la base de datos');
    }
};

export const deleteProgram = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del programa es requerido');
        }

        const existingProgram = await ProgramsModule.getProgramById(id);
        if (!existingProgram) {
            throw new Error('Programa no encontrado');
        }

        const result = await ProgramsModule.deleteProgram(id);

        if (result.affectedRows === 0) {
            throw new Error('No se pudo eliminar el programa');
        }

        return true;
    } catch (error) {
        console.error('Error en deleteProgram:', error);
        if (error.message.includes('requerido') || error.message.includes('no encontrada') || error.message.includes('eliminar')) {
            throw error;
        }
        throw new Error('Error al eliminar el programa de la base de datos');
    }
}; 