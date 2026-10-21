import { z } from 'zod';

// Permissive-first schemas: they mirror exactly what the server accepts TODAY (see design §2.1).
// Types are derived with z.infer and replace the Phase-1 hand-written input types where consumed.

export const AuthLogin = z.object({
  email: z.string(),
  password: z.string(),
});

export const AuthTokenBody = z.object({
  token: z.string(),
});

// Permissions JSON: a loose record of resource -> action -> boolean.
export const PermissionsSchema = z.record(z.string(), z.record(z.string(), z.boolean()));

export const RoleCreate = z.object({
  name: z.string(),
  permissions: z.union([PermissionsSchema, z.string()]),
});
export const RoleUpdate = RoleCreate;

export const UserCreate = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  roles: z.object({ id: z.unknown() }).passthrough(),
});
export const UserUpdate = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    roles: z.object({ id: z.unknown() }).passthrough().optional(),
  })
  .passthrough();

// cupos: any non-empty string (incl. "0" and "-1") or a non-zero number — mirrors the current `!cupos`.
const cuposSchema = z.union([z.string().min(1), z.number().refine((v) => v !== 0)]);

// state: present (not undefined) ONLY — the current guard is `state === undefined`, so falsy state
// (false/0/'') MUST still pass. Do NOT use a truthy refine here (that is the scenery/programs rule).
const eventStatePresent = z.unknown().refine((v) => v !== undefined, 'Todos los campos son requeridos');

const refIdObject = z.object({ id: z.unknown() }).passthrough();

export const EventCreate = z.object({
  nombre: z.string(),
  organizador: z.string(),
  scenery: refIdObject,
  programs: refIdObject,
  cupos: cuposSchema,
  horarioInicio: z.string(),
  horarioFin: z.string(),
  state: eventStatePresent,
  formAssists: refIdObject.optional(),
  formInscriptions: refIdObject.optional(),
  assists: z.unknown().optional(),
  inscriptions: z.unknown().optional(),
  formConfig: z.unknown().optional(),
});
export const EventUpdate = EventCreate;

export const EventFormConfig = z.object({
  inscriptions: z.object({ enabled: z.boolean(), startDate: z.string(), endDate: z.string() }),
  assists: z.object({ enabled: z.boolean(), startDate: z.string(), endDate: z.string() }),
});

// EventFormSubmission: `typeForm` is a plain string (NOT an enum) kept permanently in parse-and-log,
// with passthrough so arbitrary public form fields are never rejected (design NIT-4).
export const EventFormSubmission = z.object({ typeForm: z.string() }).passthrough();

export const FormCreate = z.object({
  name: z.string(),
  description: z.string(),
  fields: z.array(z.unknown()),
  state: z.unknown().refine((v) => v !== undefined, 'Todos los campos son requeridos'),
});
export const FormUpdate = FormCreate;

// scenery/programs state mirrors the current `!state` truthy reject (distinct from EventCreate).
const truthyState = z
  .union([z.string().min(1), z.number(), z.boolean()])
  .refine((v) => !!v, 'Todos los campos son requeridos');

export const SceneryCreate = z.object({ name: z.string().min(1), state: truthyState });
export const SceneryUpdate = SceneryCreate;
export const ProgramCreate = z.object({ name: z.string().min(1), state: truthyState });
export const ProgramUpdate = ProgramCreate;

export const FileNameParam = z.object({ name: z.string() });

export type AuthLoginInput = z.infer<typeof AuthLogin>;
export type EventCreateInput = z.infer<typeof EventCreate>;
export type FormCreateInput = z.infer<typeof FormCreate>;
export type RoleCreateInput = z.infer<typeof RoleCreate>;
export type UserCreateInput = z.infer<typeof UserCreate>;
