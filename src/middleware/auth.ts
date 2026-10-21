import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../lib/AppError.js';
import { RoleModule } from '../models/roles.module.js';
import { parseJsonColumn } from '../lib/parseJsonColumn.js';
import type { JwtUser, Permissions, ResourceKey, ActionKey } from '../types/domain.js';

/**
 * authenticate replaces verifyToken. Verbatim messages from the current verifyToken (which ran first
 * on every protected route): no header -> 'Token no proporcionado'; empty bearer -> 'Formato de token
 * inválido'; bad/expired token -> 'Token inválido'. All three are 401, never 500 (jwt.verify is always
 * wrapped in try/catch).
 */
export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(new AppError(401, 'Token no proporcionado'));
  const bearer = authHeader.split(' ')[1];
  if (!bearer) return next(new AppError(401, 'Formato de token inválido'));
  try {
    req.user = jwt.verify(bearer, env.JWT_SECRET) as JwtUser;
    next();
  } catch {
    next(new AppError(401, 'Token inválido'));
  }
};

// Verbatim Spanish permission messages = the contract (snapshot-enforced). Transcribed from the six
// per-resource middleware files (design §3.1). `files`/`experimental` messages are design-chosen for
// the NEW Phase-3 checks (no prior middleware existed).
export const PERM_MSG = {
  events: {
    create: 'No tienes permisos para crear eventos',
    edit: 'No tienes permisos para actualizar eventos',
    delete: 'No tienes permisos para eliminar eventos',
    view: 'No tienes permisos para ver eventos',
  },
  users: {
    create: 'No tienes permisos para crear usuarios',
    edit: 'No tienes permisos para actualizar usuarios',
    delete: 'No tienes permisos para eliminar usuarios',
    view: 'No tienes permisos para obtener usuarios',
  },
  roles: {
    create: 'No tienes permisos para crear roles',
    edit: 'No tienes permisos para actualizar roles',
    delete: 'No tienes permisos para eliminar roles',
    view: '',
  },
  scenery: {
    create: 'No tienes permisos para crear escenarios',
    edit: 'No tienes permisos para actualizar escenarios',
    delete: 'No tienes permisos para eliminar escenarios',
    view: '',
  },
  programs: {
    create: 'No tienes permisos para crear programas',
    edit: 'No tienes permisos para actualizar programas',
    delete: 'No tienes permisos para eliminar programas',
    view: '',
  },
  forms: {
    create: 'No tienes permisos para crear formularios',
    edit: 'No tienes permisos para actualizar formularios',
    delete: 'No tienes permisos para eliminar formularios',
    view: '',
  },
  files: { read: 'No tienes permisos para acceder a los archivos' },
  experimental: { delete: 'No tienes permisos para esta operación' },
} as const;

type PermMsg = typeof PERM_MSG;

function permMessage(resource: ResourceKey, action: ActionKey | 'read'): string {
  const resourceMsgs = PERM_MSG[resource] as Record<string, string>;
  return resourceMsgs?.[action] ?? 'No tienes permisos para realizar esta acción';
}

/**
 * requirePermission runs after authenticate (so req.user is set) and reads permissions from the DB
 * each request. Admin is identified by the additive isAdmin JWT flag. A deleted role -> 401 (approved
 * change ii; was a 500/crash).
 */
export const requirePermission = (
  resource: keyof PermMsg,
  action: string,
): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    const msg = permMessage(resource as ResourceKey, action as ActionKey | 'read');
    if (!user) return next(new AppError(401, msg));
    if (user.isAdmin === true) return next();
    try {
      const role = await RoleModule.getRoleByName(user.role);
      if (!role) return next(new AppError(401, msg)); // deleted role -> 401 (approved change ii)
      const perms = parseJsonColumn<Permissions>(role.permissions);
      if (!perms?.[resource]?.[action]) return next(new AppError(401, msg));
      next();
    } catch (e) {
      next(e);
    }
  };
};
