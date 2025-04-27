import { EventsModule } from '../models/events.module.js';
import { FormsModule } from '../models/forms.module.js';
import { SceneryModule } from '../models/scenery.module.js';

export const getForms = async () => {
    try {
        const forms = await FormsModule.getForms();
        return forms.map(form => ({
            ...form,
            fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields
        }));
    } catch (error) {
        console.error('Error en getForms:', error);
        throw new Error('Error al obtener los formularios de la base de datos');
    }
};

export const getFormData = async (eventId, typeForm) => {
    try {
        const event = await EventsModule.getEventById(eventId);

        if (!event) {
            throw new Error('Evento no encontrado');
        }

        const eventFormatted = {
            ...event,
            horarioInicio: event.horarioInicio.split('.')[0],
            horarioFin: event.horarioFin.split('.')[0],
            scenery: typeof event.scenery === 'string' ? JSON.parse(event.scenery) : event.scenery,
            programs: typeof event.programs === 'string' ? JSON.parse(event.programs) : event.programs,
            assists: undefined,
            inscriptions: undefined,
            formAssists: typeof event.formAssists === 'string' ? JSON.parse(event.formAssists) : event.formAssists,
            formInscriptions: typeof event.formInscriptions === 'string' ? JSON.parse(event.formInscriptions) : event.formInscriptions
        }

        const sceneryId = eventFormatted.scenery.id
        const scenery = await SceneryModule.getSceneryById(sceneryId)

        if (!scenery) {
            throw new Error('Escenario no encontrado');
        }

        const formId = eventFormatted[typeForm].id
        const form = await FormsModule.getFormById(formId)

        if (!form) {
            throw new Error('Formulario no encontrado');
        }

        const payload = {
            event: eventFormatted,
            form: {
                ...form,
                fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields
            },
            scenery: scenery
        }
        

        return payload
    } catch (error) {
        console.error('Error en getFormData:', error);
        throw error;
    }
};


export const getFormById = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del formulario es requerido');
        }

        const form = await FormsModule.getFormById(id)

        if (!form) {
            throw new Error('Formulario no encontrado');
        }

        return {
            ...form,
            fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields
        };
    } catch (error) {
        console.error('Error en getFormById:', error);
        throw error;
    }
};

export const createForm = async (formData) => {
    try {
        const { name, description, fields, state } = formData;

        if (!name || !description || !fields || state === undefined) {
            throw new Error('Todos los campos son requeridos');
        }

        const existingForm = await FormsModule.getFormByName(name);
        if (existingForm) {
            throw new Error('Ya existe un formulario con ese nombre');
        }

        const payload = {
            name,
            description,
            fields: JSON.stringify(fields),
            state
        }

        const result = await FormsModule.createForm(payload);

        return {
            id: result.insertId,
            ...payload,
            fields: typeof payload.fields === 'string' ? JSON.parse(payload.fields) : payload.fields
        };
    } catch (error) {
        console.error('Error en createForm:', error);
        throw error;
    }
};

export const updateForm = async (id, formData) => {
    try {
        const { name, description, fields, state } = formData;

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
            state
        }

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

export const deleteForm = async (id) => {
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