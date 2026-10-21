import { pool } from '../database/config.js';
import { EventsModule } from '../models/events.module.js';
import { SubmissionsModule } from '../models/submissions.module.js';
import { Utils } from '../lib/Utils.js';
import { SceneryModule } from '../models/scenery.module.js';
import { ProgramsModule } from '../models/programs.module.js';
import { FormsModule } from '../models/forms.module.js';
import { parseJsonColumn } from '../lib/parseJsonColumn.js';
import { AppError } from '../lib/AppError.js';
import { v4 as uuidv4 } from 'uuid';
import type { EventRecord } from '../types/domain.js';

type AnyRecord = Record<string, unknown>;

// Hydrate an event's static JSON columns. inscriptions/assists are injected separately from
// event_submissions (R2: byte-identical to the legacy array) so they are omitted here.
const hydrateEventBase = (event: EventRecord): AnyRecord => ({
  ...event,
  horarioInicio: event.horarioInicio.split('.')[0],
  horarioFin: event.horarioFin.split('.')[0],
  scenery: parseJsonColumn(event.scenery),
  programs: parseJsonColumn(event.programs),
  formAssists: parseJsonColumn(event.formAssists),
  formInscriptions: parseJsonColumn(event.formInscriptions),
  formConfig: parseJsonColumn(event.formConfig),
});

// Map a submission row's JSON data back with NO key changes/reordering (R2 element fidelity).
const submissionData = (value: unknown): unknown => parseJsonColumn(value);

export const getEvents = async (): Promise<AnyRecord[]> => {
  try {
    const events = await EventsModule.getEvents();

    // Reconcile against the FULL event-id set so a zero-submission event keeps []/[] (MEDIUM-2).
    const byId = new Map<string, AnyRecord>();
    for (const event of events) {
      const base = hydrateEventBase(event);
      base.inscriptions = [];
      base.assists = [];
      byId.set(event.id, base);
    }

    const rows = await SubmissionsModule.getByEventIds(events.map((e) => e.id));
    for (const row of rows) {
      const target = byId.get(row.event_id);
      if (!target) continue;
      const bucket = row.type === 'inscription' ? 'inscriptions' : 'assists';
      (target[bucket] as unknown[]).push(submissionData(row.data));
    }

    // Preserve the DB row order of events.
    return events.map((e) => byId.get(e.id)!);
  } catch (error) {
    console.error('Error en getEvents:', error);
    throw new Error('Error al obtener los eventos de la base de datos');
  }
};

export const getEventById = async (id: string): Promise<AnyRecord> => {
  try {
    if (!id) {
      throw new Error('El ID del evento es requerido');
    }

    const event = await EventsModule.getEventById(id);

    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const base = hydrateEventBase(event);
    base.inscriptions = [];
    base.assists = [];

    const rows = await SubmissionsModule.getByEventId(id);
    for (const row of rows) {
      const bucket = row.type === 'inscription' ? 'inscriptions' : 'assists';
      (base[bucket] as unknown[]).push(submissionData(row.data));
    }

    return base;
  } catch (error) {
    console.error('Error en getEventById:', error);
    const message = (error as Error).message;
    if (message.includes('requerido') || message.includes('no encontrado')) {
      throw error;
    }
    throw new Error('Error al obtener el evento de la base de datos');
  }
};

export const createEvent = async (eventData: AnyRecord): Promise<AnyRecord> => {
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
      inscriptions,
      formConfig,
    } = eventData as {
      nombre?: string;
      organizador?: string;
      scenery?: { id: unknown };
      programs?: { id: unknown };
      cupos?: unknown;
      horarioInicio?: string;
      horarioFin?: string;
      state?: unknown;
      formAssists?: { id: unknown };
      formInscriptions?: { id: unknown };
      assists?: unknown;
      inscriptions?: unknown;
      formConfig?: unknown;
    };

    if (
      !nombre ||
      !organizador ||
      !scenery ||
      !programs ||
      !cupos ||
      !horarioInicio ||
      !horarioFin ||
      state === undefined
    ) {
      console.log('Campos faltantes en createEvent:', {
        nombre: !!nombre,
        organizador: !!organizador,
        scenery: !!scenery,
        programs: !!programs,
        cupos: !!cupos,
        horarioInicio: !!horarioInicio,
        horarioFin: !!horarioFin,
        state: state !== undefined,
      });
      throw new Error('Todos los campos son requeridos');
    }

    if (scenery.id == -1) {
      const scenery_module = await SceneryModule.getSceneries();
      const scenery_selected = scenery_module[0];
      scenery.id = scenery_selected?.id;
    }

    if (programs.id == -1) {
      const programs_module = await ProgramsModule.getPrograms();
      const program_selected = programs_module[0];
      programs.id = program_selected?.id;
    }

    if (formAssists?.id == -1) {
      const formAssists_module = await FormsModule.getForms();
      const formAssists_selected = formAssists_module[0];
      formAssists.id = formAssists_selected?.id;
    }

    if (formInscriptions?.id == -1) {
      const formInscriptions_module = await FormsModule.getForms();
      const formInscriptions_selected = formInscriptions_module[0];
      formInscriptions.id = formInscriptions_selected?.id;
    }

    const existingScenery = await SceneryModule.getSceneryById(String(scenery.id));
    if (!existingScenery) {
      throw new Error('El escenario especificado no existe');
    }

    const existingProgram = await ProgramsModule.getProgramById(String(programs.id));
    if (!existingProgram) {
      throw new Error('El programa especificado no existe');
    }

    const existingFormAssists = await FormsModule.getFormById(String(formAssists?.id));
    if (!existingFormAssists) {
      throw new Error('El formulario de asistencia especificado no existe');
    }

    const existingFormInscriptions = await FormsModule.getFormById(String(formInscriptions?.id));
    if (!existingFormInscriptions) {
      throw new Error('El formulario de inscripción especificado no existe');
    }

    const payload: AnyRecord = {
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
      inscriptions: JSON.stringify(inscriptions || []),
      formConfig: JSON.stringify(formConfig || {}),
    };

    const result = await EventsModule.createEvent(payload);

    if (result.affectedRows === 0) {
      throw new Error('Evento no creado');
    }

    const eventConfigForm = await EventsModule.getEventConfigFormById(payload.id as string);

    return {
      id: payload.id,
      ...payload,
      scenery: parseJsonColumn(payload.scenery),
      programs: parseJsonColumn(payload.programs),
      formAssists: parseJsonColumn(payload.formAssists),
      formInscriptions: parseJsonColumn(payload.formInscriptions),
      assists: parseJsonColumn(payload.assists),
      inscriptions: parseJsonColumn(payload.inscriptions),
      formConfig: parseJsonColumn(eventConfigForm?.formConfig),
    };
  } catch (error) {
    console.error('Error en createEvent:', error);
    throw error;
  }
};

export const updateEvent = async (id: string, eventData: AnyRecord): Promise<boolean> => {
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
      inscriptions,
      formConfig,
    } = eventData as AnyRecord;

    if (
      !nombre ||
      !organizador ||
      !scenery ||
      !programs ||
      !cupos ||
      !horarioInicio ||
      !horarioFin ||
      state === undefined
    ) {
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
      inscriptions: JSON.stringify(inscriptions || []),
      formConfig: JSON.stringify(formConfig || {}),
    };

    const result = await EventsModule.updateEvent(id, payload);

    if (result.affectedRows === 0) {
      throw new Error('Evento no encontrado');
    }

    return true;
  } catch (error) {
    console.error('Error en updateEvent:', error);
    const message = (error as Error).message;
    if (message.includes('requeridos') || message.includes('no encontrado')) {
      throw error;
    }
    throw new Error('Error al actualizar el evento en la base de datos');
  }
};

/**
 * Atomic quota enforcement via SELECT ... FOR UPDATE on the parent events row, then a count-guarded
 * INSERT into event_submissions PLUS a dual-write to the legacy JSON column — both under the lock.
 * - Quota is counted from the LEGACY JSON array length under the lock (the current source of truth)
 *   during the dual-write window (design §4.3 — must not count event_submissions until backfill is
 *   verified + legacy columns dropped).
 * - Over-quota throws AppError(500, 'No hay cupos disponibles') (status 500, preserved).
 * - An UNKNOWN typeForm (neither 'inscriptions' nor 'assists') is a SILENT NO-OP that still commits
 *   and returns true -> 200 success with arrays unchanged (preserved no-op).
 */
export const updateEventForm = async (id: string, formData: AnyRecord): Promise<boolean> => {
  if (!id || !formData) {
    throw new Error('Los campos formulario son requeridos');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [lockRows] = (await conn.query(
      'SELECT cupos, inscriptions, assists FROM events WHERE id = ? FOR UPDATE',
      [id],
    )) as unknown as [AnyRecord[], unknown];
    const locked = lockRows[0];

    if (!locked) {
      // events never 404 — stay 500 (design §0.1). Thrown as a plain error; controller maps to 500.
      throw new Error('Evento no encontrado');
    }

    const typeForm = formData.typeForm;
    const dbType =
      typeForm === 'inscriptions' ? 'inscription' : typeForm === 'assists' ? 'assist' : null;

    if (dbType === 'inscription') {
      const maxCupos = Number(locked.cupos);
      if (maxCupos !== -1) {
        // COUNT SOURCE during the dual-write window = the LEGACY JSON array length under the lock.
        const currentCupos = parseJsonColumn<unknown[]>(locked.inscriptions).length;
        if (currentCupos >= maxCupos) {
          throw new AppError(500, 'No hay cupos disponibles');
        }
      }
    }

    if (dbType === 'inscription' || dbType === 'assist') {
      const { typeForm: _typeForm, ...rest } = formData; // strip typeForm (R2: identical to legacy)

      // 1) normalized insert into event_submissions (monotonic seq).
      await SubmissionsModule.insert(conn, {
        id: uuidv4(),
        event_id: id,
        type: dbType,
        data: JSON.stringify(rest),
      });

      // 2) dual-write the legacy JSON column under the same lock (no longer racy).
      const column = dbType === 'inscription' ? 'inscriptions' : 'assists';
      const legacy = parseJsonColumn<unknown[]>(
        dbType === 'inscription' ? locked.inscriptions : locked.assists,
      );
      const updated = [...legacy, rest];
      await conn.query(`UPDATE events SET ${column} = ? WHERE id = ?`, [JSON.stringify(updated), id]);
    }
    // Unknown typeForm: no insert, no dual-write — the preserved silent no-op.

    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    console.error('Error en updateEventForm:', error);
    throw error;
  } finally {
    conn.release();
  }
};

export const updateEventConfigForm = async (
  id: string,
  configForm: AnyRecord,
): Promise<boolean> => {
  try {
    const event = await EventsModule.getEventById(id);

    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const result = await EventsModule.updateEventConfigForm(id, JSON.stringify(configForm));

    if (result.affectedRows === 0) {
      throw new Error('Evento no encontrado');
    }

    return true;
  } catch (error) {
    console.error('Error en updateEventConfigForm:', error);
    throw error;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    const result = await EventsModule.deleteEvent(id);

    if (result.affectedRows === 0) {
      throw new Error('Evento no encontrado');
    }

    return true;
  } catch (error) {
    console.error('Error en deleteEvent:', error);
    if ((error as Error).message.includes('no encontrado')) {
      throw error;
    }
    throw new Error('Error al eliminar el evento de la base de datos');
  }
};
