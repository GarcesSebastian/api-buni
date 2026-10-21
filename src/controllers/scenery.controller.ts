import type { Request, Response } from 'express';
import {
  getSceneries,
  getSceneryById,
  createScenery,
  updateScenery,
  deleteScenery,
} from '../services/scenery.service.js';

export const GetSceneries = async (req: Request, res: Response) => {
  try {
    const sceneries = await getSceneries();
    res.json(sceneries);
  } catch (error) {
    console.error('Error al obtener escenarios:', error);
    res.status(500).json({ error: (error as Error).message || 'Error al obtener los escenarios' });
  }
};

export const GetSceneryById = async (req: Request, res: Response) => {
  try {
    const scenery = await getSceneryById(req.params.id as string);
    res.json(scenery);
  } catch (error) {
    console.error('Error al obtener escenario:', error);
    res.status(500).json({ error: (error as Error).message || 'Error al obtener el escenario' });
  }
};

export const CreateScenery = async (req: Request, res: Response) => {
  try {
    const { name, state } = req.body as { name?: string; state?: string };

    if (!name || !state) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const scenery = await createScenery(name, state);
    res.status(201).json({
      message: 'Escenario creado exitosamente',
      data: scenery,
    });
  } catch (error) {
    console.error('Error al crear escenario:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('ya existe')) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message || 'Error al crear el escenario' });
  }
};

export const UpdateScenery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, state } = req.body as { name?: string; state?: string };

    if (!name || !state) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const scenery = await updateScenery(id as string, name, state);
    res.json({
      message: 'Escenario actualizado exitosamente',
      data: scenery,
    });
  } catch (error) {
    console.error('Error al actualizar escenario:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('no encontrado')) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message || 'Error al actualizar el escenario' });
  }
};

export const DeleteScenery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'El ID del escenario es requerido' });
    }

    const result = await deleteScenery(id);
    res.json({
      message: 'Escenario eliminado exitosamente',
      data: result,
    });
  } catch (error) {
    console.error('Error al eliminar escenario:', error);
    const message = (error as Error).message;
    if (message.includes('no encontrado')) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message || 'Error al eliminar el escenario' });
  }
};
