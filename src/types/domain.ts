// Hand-written domain types for the Phase-1 migration. Phase 2 replaces the input-shaped ones with
// z.infer from the Zod schemas; these describe the shapes the DB layer and services pass around.

export type ActionKey = 'view' | 'create' | 'edit' | 'delete';
export type ResourceKey =
  | 'events'
  | 'users'
  | 'roles'
  | 'scenery'
  | 'programs'
  | 'forms'
  | 'files'
  | 'experimental';

/** Per-resource permission flags. The admin sentinel is the string '***'. */
export type Permissions = Record<string, Record<string, boolean>>;

export interface Role {
  id: string;
  name: string;
  permissions: Permissions | string;
  created_at?: string;
}

export interface User {
  id: string;
  role_id: string | null;
  name: string;
  email: string;
  created_at?: string;
}

export interface Scenery {
  id: string;
  name: string;
  state: string;
  created_at?: string;
}

export interface Program {
  id: string;
  name: string;
  state: string;
  created_at?: string;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  fields: unknown;
  state: string;
  created_at?: string;
}

export interface FormConfigSection {
  enabled: boolean;
  startDate: string;
  endDate: string;
}

export interface FormConfig {
  inscriptions: FormConfigSection;
  assists: FormConfigSection;
}

export interface EventRecord {
  id: string;
  nombre: string;
  organizador: string;
  scenery: unknown;
  programs: unknown;
  cupos: string;
  horarioInicio: string;
  horarioFin: string;
  state: string;
  formAssists: unknown;
  formInscriptions: unknown;
  assists: unknown;
  inscriptions: unknown;
  formConfig: unknown;
  created_at?: string;
}

/** The JWT payload the auth layer signs/verifies. `isAdmin` is added in Phase 3 (additive). */
export interface JwtUser {
  id?: string;
  name?: string;
  email: string;
  role: string;
  permissions: Permissions | '***';
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}
