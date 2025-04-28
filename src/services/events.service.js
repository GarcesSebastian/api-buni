import { EventsModule } from '../models/events.module.js';
import { Utils } from '../lib/Utils.js';
import { SceneryModule } from '../models/scenery.module.js';
import { ProgramsModule } from '../models/programs.module.js';
import { FormsModule } from '../models/forms.module.js';

export const getEvents = async () => {
    try {
        const events = await EventsModule.getEvents();
        
        const eventsData = events.map(event => {
            return {
                ...event,
                horarioInicio: event.horarioInicio.split('.')[0],
                horarioFin: event.horarioFin.split('.')[0],
                scenery: typeof event.scenery === 'string' ? JSON.parse(event.scenery) : event.scenery,
                programs: typeof event.programs === 'string' ? JSON.parse(event.programs) : event.programs,
                formAssists: typeof event.formAssists === 'string' ? JSON.parse(event.formAssists) : event.formAssists,
                formInscriptions: typeof event.formInscriptions === 'string' ? JSON.parse(event.formInscriptions) : event.formInscriptions,
                assists: typeof event.assists === 'string' ? JSON.parse(event.assists) : event.assists,
                inscriptions: typeof event.inscriptions === 'string' ? JSON.parse(event.inscriptions) : event.inscriptions
            };
        });

        return eventsData;
    } catch (error) {
        console.error('Error en getEvents:', error);
        throw new Error('Error al obtener los eventos de la base de datos');
    }
};

export const getEventById = async (id) => {
    try {
        if (!id) {
            throw new Error('El ID del evento es requerido');
        }

        const event = await EventsModule.getEventById(id);

        if (!event) {
            throw new Error('Evento no encontrado');
        }

        return {
            ...event,
            horarioInicio: event.horarioInicio.split('.')[0],
            horarioFin: event.horarioFin.split('.')[0],
            scenery: typeof event.scenery === 'string' ? JSON.parse(event.scenery) : event.scenery,
            programs: typeof event.programs === 'string' ? JSON.parse(event.programs) : event.programs,
            formAssists: typeof event.formAssists === 'string' ? JSON.parse(event.formAssists) : event.formAssists,
            formInscriptions: typeof event.formInscriptions === 'string' ? JSON.parse(event.formInscriptions) : event.formInscriptions,
            assists: typeof event.assists === 'string' ? JSON.parse(event.assists) : event.assists,
            inscriptions: typeof event.inscriptions === 'string' ? JSON.parse(event.inscriptions) : event.inscriptions
        };
    } catch (error) {
        console.error('Error en getEventById:', error);
        if (error.message.includes('requerido') || error.message.includes('no encontrado')) {
            throw error;
        }
        throw new Error('Error al obtener el evento de la base de datos');
    }
};

export const createEvent = async (eventData) => {
    try {
        const {
            nombre,
            organizador,
            scenery,
            programs,
            cupos,
            horarioInicio,
            horarioFin,
            state,
            formAssists,
            formInscriptions,
            assists,
            inscriptions
        } = eventData;

        if (!nombre || !organizador || !scenery || !programs || !cupos || !horarioInicio || !horarioFin || state === undefined) {
            throw new Error('Todos los campos son requeridos');
        }

        if(scenery.id == -1){
            const scenery_module = await SceneryModule.getSceneries();
            const scenery_selected = scenery_module[0];
            scenery.id = scenery_selected.id;
        }

        if(programs.id == -1){
            const programs_module = await ProgramsModule.getPrograms();
            const program_selected = programs_module[0];
            programs.id = program_selected.id;
        }

        if(formAssists.id == -1){
            const formAssists_module = await FormsModule.getForms();
            const formAssists_selected = formAssists_module[0];
            formAssists.id = formAssists_selected.id;
        }

        if(formInscriptions.id == -1){
            const formInscriptions_module = await FormsModule.getForms();
            const formInscriptions_selected = formInscriptions_module[0];
            formInscriptions.id = formInscriptions_selected.id;
        }

        const existingScenery = await SceneryModule.getSceneryById(scenery.id);
        if (!existingScenery) {
            throw new Error('El escenario especificado no existe');
        }

        const existingProgram = await ProgramsModule.getProgramById(programs.id);
        if (!existingProgram) {
            throw new Error('El programa especificado no existe');
        }

        const existingFormAssists = await FormsModule.getFormById(formAssists.id);
        if (!existingFormAssists) {
            throw new Error('El formulario de asistencia especificado no existe');
        }

        const existingFormInscriptions = await FormsModule.getFormById(formInscriptions.id);
        if (!existingFormInscriptions) {
            throw new Error('El formulario de inscripción especificado no existe');
        }

        const payload = {
            id: Utils.generateUUID(),
            nombre,
            organizador,
            scenery: JSON.stringify(scenery),
            programs: JSON.stringify(programs),
            cupos,
            horarioInicio,
            horarioFin,
            state,
            formAssists: JSON.stringify(formAssists || []),
            formInscriptions: JSON.stringify(formInscriptions || []),
            assists: JSON.stringify(assists || []),
            inscriptions: JSON.stringify(inscriptions || [])
        }

        const result = await EventsModule.createEvent(payload);

        if (result.affectedRows === 0) {
            throw new Error('Evento no creado');
        }

        return {
            id: payload.id,
            ...payload,
            scenery: typeof payload.scenery === 'string' ? JSON.parse(payload.scenery) : payload.scenery,
            programs: typeof payload.programs === 'string' ? JSON.parse(payload.programs) : payload.programs,
            formAssists: typeof payload.formAssists === 'string' ? JSON.parse(payload.formAssists) : payload.formAssists,
            formInscriptions: typeof payload.formInscriptions === 'string' ? JSON.parse(payload.formInscriptions) : payload.formInscriptions,
            assists: typeof payload.assists === 'string' ? JSON.parse(payload.assists) : payload.assists,
            inscriptions: typeof payload.inscriptions === 'string' ? JSON.parse(payload.inscriptions) : payload.inscriptions
        };
    } catch (error) {
        console.error('Error en createEvent:', error);
        throw error;
    }
};

export const updateEvent = async (id, eventData) => {
    try {
        const {
            nombre,
            organizador,
            scenery,
            programs,
            cupos,
            horarioInicio,
            horarioFin,
            state,
            formAssists,
            formInscriptions,
            assists,
            inscriptions
        } = eventData;

        if (!nombre || !organizador || !scenery || !programs || !cupos || !horarioInicio || !horarioFin || state === undefined) {
            throw new Error('Todos los campos son requeridos');
        }

        const payload = {
            nombre,
            organizador,
            scenery: JSON.stringify(scenery),
            programs: JSON.stringify(programs),
            cupos,
            horarioInicio,
            horarioFin,
            state,
            formAssists: JSON.stringify(formAssists || []),
            formInscriptions: JSON.stringify(formInscriptions || []),
            assists: JSON.stringify(assists || []),
            inscriptions: JSON.stringify(inscriptions || [])
        }

        const result = await EventsModule.updateEvent(id, payload);

        if (result.affectedRows === 0) {
            throw new Error('Evento no encontrado');
        }

        return true;
    } catch (error) {
        console.error('Error en updateEvent:', error);
        if (error.message.includes('requeridos') || error.message.includes('no encontrado')) {
            throw error;
        }
        throw new Error('Error al actualizar el evento en la base de datos');
    }
};

export const updateEventForm = async (id, formData) => {
    try {
        if (!id || !formData) {
            throw new Error('Los campos formulario son requeridos');
        }

        const event = await EventsModule.getEventById(id);

        if (!event) {
            throw new Error('Evento no encontrado');
        }
        
        if (formData.typeForm === "inscriptions") {
            const { typeForm, ...rest } = formData
            const inscriptions = typeof event.inscriptions === "string" ? JSON.parse(event.inscriptions) : event.inscriptions
            event.inscriptions = [...inscriptions, rest]
        }

        if (formData.typeForm === "assists") {
            const { typeForm, ...rest } = formData
            const assists = typeof event.assists === "string" ? JSON.parse(event.assists) : event.assists
            event.assists = [...assists, rest]
        }

        const inscriptionsFormatted = typeof event.inscriptions === "object" ? JSON.stringify(event.inscriptions) : event.inscriptions
        const assistsFormatted = typeof event.assists === "object" ? JSON.stringify(event.assists) : event.assists

        const result = await EventsModule.updateEventForm(id, { inscriptions: inscriptionsFormatted, assists: assistsFormatted })

        if (result.affectedRows === 0) {
            throw new Error('Evento no encontrado');
        }

        return true;
    } catch (error) {
        console.error('Error en updateEventForm:', error);
        throw error;
    }
};

export const deleteEvent = async (id) => {
    try {
        const result = await EventsModule.deleteEvent(id);

        if (result.affectedRows === 0) {
            throw new Error('Evento no encontrado');
        }

        return true;
    } catch (error) {
        console.error('Error en deleteEvent:', error);
        if (error.message.includes('no encontrado')) {
            throw error;
        }
        throw new Error('Error al eliminar el evento de la base de datos');
    }
};