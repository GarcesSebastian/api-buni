import type { Request, Response } from 'express';
import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from '../services/programs.service.js';

export const GetPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await getPrograms();
    res.json(programs);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    res.status(500).json({ error: (error as Error).message || 'Error al obtener los programas' });
  }
};

export const GetProgramById = async (req: Request, res: Response) => {
  try {
    const program = await getProgramById(req.params.id as string);
    res.json(program);
  } catch (error) {
    console.error('Error al obtener programa:', error);
    res.status(500).json({ error: (error as Error).message || 'Error al obtener el programa' });
  }
};

export const CreateProgram = async (req: Request, res: Response) => {
  try {
    const { name, state } = req.body as { name?: string; state?: string };

    if (!name || !state) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const program = await createProgram(name, state);
    res.status(201).json({
      message: 'Programa creado exitosamente',
      data: program,
    });
  } catch (error) {
    console.error('Error al crear programa:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('ya existe')) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message || 'Error al crear el programa' });
  }
};

export const UpdateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, state } = req.body as { name?: string; state?: string };

    if (!name || !state) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const program = await updateProgram(id as string, name, state);
    res.json({
      message: 'Programa actualizado exitosamente',
      data: program,
    });
  } catch (error) {
    console.error('Error al actualizar programa:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('no encontrada')) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message || 'Error al actualizar el programa' });
  }
};

export const DeleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'El ID del programa es requerido' });
    }

    const result = await deleteProgram(id);
    res.json({
      message: 'Programa eliminado exitosamente',
      data: result,
    });
  } catch (error) {
    console.error('Error al eliminar programa:', error);
    const message = (error as Error).message;
    if (message.includes('no encontrada')) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message || 'Error al eliminar el programa' });
  }
};
