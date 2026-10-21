import { ProgramsModule } from '../models/programs.module.js';
import { Utils } from '../lib/Utils.js';
import type { Program } from '../types/domain.js';

export const getPrograms = async (): Promise<Program[]> => {
  try {
    const programs = await ProgramsModule.getPrograms();
    return programs;
  } catch (error) {
    console.error('Error en getPrograms:', error);
    throw new Error('Error al obtener los programas de la base de datos');
  }
};

export const getProgramById = async (id: string): Promise<Program> => {
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

export const createProgram = async (name: string, state: string): Promise<Record<string, unknown>> => {
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
      state,
    };

    await ProgramsModule.createProgram(payload);

    return {
      ...payload,
    };
  } catch (error) {
    console.error('Error en createProgram:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('ya existe')) {
      throw error;
    }
    throw new Error('Error al crear el programa en la base de datos');
  }
};

export const updateProgram = async (
  id: string,
  name: string,
  state: string,
): Promise<boolean> => {
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
    const message = (error as Error).message;
    if (
      message.includes('requeridos') ||
      message.includes('no encontrada') ||
      message.includes('actualizar')
    ) {
      throw error;
    }
    throw new Error('Error al actualizar el programa en la base de datos');
  }
};

export const deleteProgram = async (id: string): Promise<boolean> => {
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
    const message = (error as Error).message;
    if (
      message.includes('requerido') ||
      message.includes('no encontrada') ||
      message.includes('eliminar')
    ) {
      throw error;
    }
    throw new Error('Error al eliminar el programa de la base de datos');
  }
};
