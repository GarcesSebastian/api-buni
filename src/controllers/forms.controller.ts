import type { Request, Response } from 'express';
import {
  getForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
  getFormData,
} from '../services/forms.service.js';

export const GetForms = async (req: Request, res: Response) => {
  try {
    const forms = await getForms();

    res.json(forms);
  } catch (error) {
    console.error('Error en GetForms:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const GetFormData = async (req: Request, res: Response) => {
  try {
    const formData = await getFormData(req.params.id as string, req.params.type as string);

    res.json(formData);
  } catch (error) {
    console.error('Error en GetFormData:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const GetFormById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const form = await getFormById(id as string);

    res.json({
      message: 'Formulario obtenido exitosamente',
      data: form,
    });
  } catch (error) {
    console.error('Error en GetFormById:', error);
    if ((error as Error).message.includes('no encontrado')) {
      res.status(404).json({ error: (error as Error).message });
    } else {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};

export const CreateForm = async (req: Request, res: Response) => {
  try {
    const form = await createForm(req.body);

    res.status(201).json({
      message: 'Formulario creado exitosamente',
      data: form,
    });
  } catch (error) {
    console.error('Error en CreateForm:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('ya existe')) {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: message });
    }
  }
};

export const UpdateForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const form = await updateForm(id as string, req.body);

    res.json({
      message: 'Formulario actualizado exitosamente',
      data: form,
    });
  } catch (error) {
    console.error('Error en UpdateForm:', error);
    const message = (error as Error).message;
    if (message.includes('no encontrado')) {
      res.status(404).json({ error: message });
    } else if (message.includes('requeridos') || message.includes('ya existe')) {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: message });
    }
  }
};

export const DeleteForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteForm(id as string);

    res.json({
      message: 'Formulario eliminado exitosamente',
      data: result,
    });
  } catch (error) {
    console.error('Error en DeleteForm:', error);
    if ((error as Error).message.includes('no encontrado')) {
      res.status(404).json({ error: (error as Error).message });
    } else {
      res.status(500).json({ error: (error as Error).message });
    }
  }
};
