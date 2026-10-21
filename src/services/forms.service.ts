import moment from 'moment-timezone';
import { EventsModule } from '../models/events.module.js';
import { FormsModule } from '../models/forms.module.js';
import { SceneryModule } from '../models/scenery.module.js';
import { Utils } from '../lib/Utils.js';
import { parseJsonColumn } from '../lib/parseJsonColumn.js';
import type { Form } from '../types/domain.js';

type AnyRecord = Record<string, unknown>;

export const getForms = async (): Promise<AnyRecord[]> => {
  try {
    const forms = await FormsModule.getForms();
    return forms.map((form) => ({
      ...form,
      fields: parseJsonColumn(form.fields),
    }));
  } catch (error) {
    console.error('Error en getForms:', error);
    throw new Error('Error al obtener los formularios de la base de datos');
  }
};

export const getFormData = async (eventId: string, typeForm: string): Promise<AnyRecord> => {
  try {
    const event = await EventsModule.getEventById(eventId);

    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const eventFormatted = {
      ...event,
      horarioInicio: event.horarioInicio.split('.')[0],
      horarioFin: event.horarioFin.split('.')[0],
      scenery: parseJsonColumn(event.scenery),
      programs: parseJsonColumn(event.programs),
      assists: undefined,
      inscriptions: undefined,
      formAssists: parseJsonColumn(event.formAssists),
      formInscriptions: parseJsonColumn(event.formInscriptions),
      formConfig: parseJsonColumn(event.formConfig),
    } as AnyRecord;

    const sceneryId = (eventFormatted.scenery as { id: unknown }).id;
    const scenery = await SceneryModule.getSceneryById(String(sceneryId));

    if (!scenery) {
      throw new Error('Escenario no encontrado');
    }

    const formId = (eventFormatted[typeForm] as { id: unknown }).id;
    const form = await FormsModule.getFormById(String(formId));

    if (!form) {
      throw new Error('Formulario no encontrado');
    }

    const payload = {
      event: eventFormatted,
      form: {
        ...form,
        fields: parseJsonColumn((form as Form).fields),
      },
      scenery: scenery,
      date_now: moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss'),
      current:
        typeof event.inscriptions == 'string'
          ? (JSON.parse(event.inscriptions) as unknown[]).length
          : (event.inscriptions as unknown[]).length,
    };

    return payload;
  } catch (error) {
    console.error('Error en getFormData:', error);
    throw error;
  }
};

export const getFormById = async (id: string): Promise<AnyRecord> => {
  try {
    if (!id) {
      throw new Error('El ID del formulario es requerido');
    }

    const form = await FormsModule.getFormById(id);

    if (!form) {
      throw new Error('Formulario no encontrado');
    }

    return {
      ...form,
      fields: parseJsonColumn(form.fields),
    };
  } catch (error) {
    console.error('Error en getFormById:', error);
    throw error;
  }
};

export const createForm = async (formData: AnyRecord): Promise<AnyRecord> => {
  try {
    const { name, description, fields, state } = formData as {
      name?: string;
      description?: string;
      fields?: unknown;
      state?: unknown;
    };

    if (!name || !description || !fields || state === undefined) {
      throw new Error('Todos los campos son requeridos');
    }

    const existingForm = await FormsModule.getFormByName(name);
    if (existingForm) {
      throw new Error('Ya existe un formulario con ese nombre');
    }

    const payload = {
      id: Utils.generateUUID(),
      name,
      description,
      fields: JSON.stringify(fields),
      state,
    };

    await FormsModule.createForm(payload);

    return {
      ...payload,
      fields: parseJsonColumn(payload.fields),
    };
  } catch (error) {
    console.error('Error en createForm:', error);
    throw error;
  }
};

export const updateForm = async (id: string, formData: AnyRecord): Promise<boolean> => {
  try {
    const { name, description, fields, state } = formData as {
      name?: string;
      description?: string;
      fields?: unknown;
      state?: unknown;
    };

    if (!id || !name || !description || !fields || state === undefined) {
      throw new Error('Todos los campos son requeridos');
    }

    const existingForm = await FormsModule.getFormById(id);
    if (!existingForm) {
      throw new Error('Formulario no encontrado');
    }

    const isSameName = existingForm.name === name;
    const nameForm = await FormsModule.getFormByName(name);
    if (nameForm && !isSameName) {
      throw new Error('Ya existe un formulario con ese nombre');
    }

    const payload = {
      name,
      description,
      fields: JSON.stringify(fields),
      state,
    };

    const result = await FormsModule.updateForm(id, payload);
    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el formulario');
    }

    return true;
  } catch (error) {
    console.error('Error en updateForm:', error);
    throw error;
  }
};

export const deleteForm = async (id: string): Promise<boolean> => {
  try {
    if (!id) {
      throw new Error('El ID del formulario es requerido');
    }

    const existingForm = await FormsModule.getFormById(id);
    if (!existingForm) {
      throw new Error('Formulario no encontrado');
    }

    const result = await FormsModule.deleteForm(id);

    if (result.affectedRows === 0) {
      throw new Error('No se pudo eliminar el formulario');
    }

    return true;
  } catch (error) {
    console.error('Error en deleteForm:', error);
    throw error;
  }
};
