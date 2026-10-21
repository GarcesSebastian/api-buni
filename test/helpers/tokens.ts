// JWT builders mirroring exactly what auth.controller.Login signs today, so protected-route tests
// present tokens the current server accepts.
import jwt from 'jsonwebtoken';
import { CUSTOM_PERMISSIONS } from './fixture.js';

const secret = () => process.env.JWT_SECRET as string;

export function adminToken(): string {
  return jwt.sign(
    {
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      role: process.env.ADMIN_ROLE,
      permissions: '***',
      // Phase 3: admin is identified by the additive isAdmin flag (not permissions === '***').
      isAdmin: true,
    },
    secret(),
    { expiresIn: '24h' },
  );
}

/** A normal user token whose role ('coordinador') exists with the partial CUSTOM_PERMISSIONS set. */
export function normalUserToken(): string {
  return jwt.sign(
    {
      id: 'user-0000-0000-0000-000000000001',
      name: 'Usuario Normal',
      email: 'normal@buni.test',
      role: 'coordinador',
      permissions: CUSTOM_PERMISSIONS,
    },
    secret(),
    { expiresIn: '24h' },
  );
}

/** A valid-signature token whose role name no longer exists in the roles table (deleted role). */
export function deletedRoleToken(): string {
  return jwt.sign(
    {
      id: 'user-0000-0000-0000-000000000002',
      name: 'Usuario Sin Rol',
      email: 'sinrol@buni.test',
      role: 'rol-huerfano',
      permissions: CUSTOM_PERMISSIONS,
    },
    secret(),
    { expiresIn: '24h' },
  );
}

export const expiredToken = (): string =>
  jwt.sign({ email: 'x@y.z', role: 'coordinador', permissions: {} }, secret(), { expiresIn: -10 });

export const malformedSignatureToken = (): string =>
  // Valid JWT format (3 dot-separated base64url segments) but signed with the wrong secret.
  jwt.sign({ email: 'x@y.z' }, 'a_totally_different_wrong_secret_value_1234', { expiresIn: '1h' });
