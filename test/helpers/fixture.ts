// Deterministic fixture for the characterization harness.
// Fixed UUIDs + a known normal-user password so snapshots are stable across runs.
import bcrypt from 'bcryptjs';

export const NORMAL_USER_PASSWORD = 'normal1234';

// Precomputed bcryptjs hash of NORMAL_USER_PASSWORD (cost 10). Computed at load so the seed is fast
// and deterministic; the hash itself is normalized out of snapshots (it is never asserted directly).
export const getNormalUserPasswordHash = () => bcrypt.hashSync(NORMAL_USER_PASSWORD, 10);

export const IDS = {
  roleCustom: 'role-0000-0000-0000-000000000001',
  roleToDelete: 'role-0000-0000-0000-000000000002',
  userNormal: 'user-0000-0000-0000-000000000001',
  userDeletedRole: 'user-0000-0000-0000-000000000002',
  sceneryA: 'scen-0000-0000-0000-000000000001',
  programA: 'prog-0000-0000-0000-000000000001',
  formInscriptions: 'form-0000-0000-0000-000000000001',
  formAssists: 'form-0000-0000-0000-000000000002',
  eventUnlimited: 'evnt-0000-0000-0000-000000000001', // cupos = -1
  eventLimited2: 'evnt-0000-0000-0000-000000000002', // cupos = 2
  eventZero: 'evnt-0000-0000-0000-000000000003', // cupos = 0 (empty inscriptions/assists)
} as const;

// A partial permission set: this custom role can view/create events but nothing else.
export const CUSTOM_PERMISSIONS = {
  events: { view: true, create: true, edit: false, delete: false },
  users: { view: false, create: false, edit: false, delete: false },
  roles: { view: false, create: false, edit: false, delete: false },
  scenery: { view: false, create: false, edit: false, delete: false },
  programs: { view: false, create: false, edit: false, delete: false },
  forms: { view: false, create: false, edit: false, delete: false },
};

const INSCRIPTION_FORM = {
  id: 'form-0000-0000-0000-000000000001',
  name: 'Formulario de inscripción',
};
const ASSIST_FORM = {
  id: 'form-0000-0000-0000-000000000002',
  name: 'Formulario de asistencia',
};
const SCENERY_REF = { id: 'scen-0000-0000-0000-000000000001', name: 'Escenario A' };
const PROGRAM_REF = { id: 'prog-0000-0000-0000-000000000001', name: 'Programa A' };

const EMPTY_FORM_CONFIG = {
  inscriptions: { enabled: false, startDate: '', endDate: '' },
  assists: { enabled: false, startDate: '', endDate: '' },
};

export interface SeedData {
  roles: Array<{ id: string; name: string; permissions: string }>;
  users: Array<{ id: string; role_id: string | null; name: string; email: string; password: string }>;
  sceneries: Array<{ id: string; name: string; state: string }>;
  programs: Array<{ id: string; name: string; state: string }>;
  forms: Array<{ id: string; name: string; description: string; fields: string; state: string }>;
  events: Array<Record<string, unknown>>;
}

export function buildSeedData(): SeedData {
  const pwdHash = getNormalUserPasswordHash();

  const baseEvent = (id: string, nombre: string, cupos: string) => ({
    id,
    nombre,
    organizador: 'Organizador Buni',
    scenery: JSON.stringify(SCENERY_REF),
    programs: JSON.stringify(PROGRAM_REF),
    cupos,
    horarioInicio: '2025-01-01 09:00:00',
    horarioFin: '2025-01-01 12:00:00',
    state: 'active',
    formAssists: JSON.stringify(ASSIST_FORM),
    formInscriptions: JSON.stringify(INSCRIPTION_FORM),
    assists: JSON.stringify([]),
    inscriptions: JSON.stringify([]),
    formConfig: JSON.stringify(EMPTY_FORM_CONFIG),
  });

  return {
    roles: [
      { id: IDS.roleCustom, name: 'coordinador', permissions: JSON.stringify(CUSTOM_PERMISSIONS) },
      { id: IDS.roleToDelete, name: 'rol-huerfano', permissions: JSON.stringify(CUSTOM_PERMISSIONS) },
    ],
    users: [
      {
        id: IDS.userNormal,
        role_id: IDS.roleCustom,
        name: 'Usuario Normal',
        email: 'normal@buni.test',
        password: pwdHash,
      },
      {
        // This user's role row is deleted during the seed to characterize the deleted-role paths.
        id: IDS.userDeletedRole,
        role_id: IDS.roleToDelete,
        name: 'Usuario Sin Rol',
        email: 'sinrol@buni.test',
        password: pwdHash,
      },
    ],
    sceneries: [{ id: IDS.sceneryA, name: 'Escenario A', state: 'active' }],
    programs: [{ id: IDS.programA, name: 'Programa A', state: 'active' }],
    forms: [
      {
        id: IDS.formInscriptions,
        name: 'Formulario de inscripción',
        description: 'Formulario base de inscripción',
        fields: JSON.stringify([{ name: 'nombre', type: 'text' }]),
        state: 'active',
      },
      {
        id: IDS.formAssists,
        name: 'Formulario de asistencia',
        description: 'Formulario base de asistencia',
        fields: JSON.stringify([{ name: 'nombre', type: 'text' }]),
        state: 'active',
      },
    ],
    events: [
      baseEvent(IDS.eventUnlimited, 'Evento Ilimitado', '-1'),
      baseEvent(IDS.eventLimited2, 'Evento Limitado 2', '2'),
      baseEvent(IDS.eventZero, 'Evento Cupo Cero', '0'),
    ],
  };
}
