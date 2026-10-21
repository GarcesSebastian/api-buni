import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../database/config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModule } from '../models/user.module.js';
import { parseJsonColumn } from '../lib/parseJsonColumn.js';
import { env } from '../config/env.js';
import { adminHash } from '../config/adminHash.js';
import { logger } from '../lib/logger.js';

// token_hs: additive HttpOnly handshake cookie. Cross-site deployment (APP_API_TOPOLOGY default)
// requires SameSite=None; Secure. Same-site topology may relax to SameSite=Lax.
const sameSite = env.APP_API_TOPOLOGY === 'same-site' ? 'Lax' : 'None';
const secureAttr = env.APP_API_TOPOLOGY === 'same-site' ? '' : ' Secure;';
const setTokenHsCookie = (res: Response, token: string) => {
  res.append(
    'Set-Cookie',
    `token_hs=${token}; HttpOnly;${secureAttr} SameSite=${sameSite}; Path=/; Max-Age=86400`,
  );
};
const clearTokenHsCookie = (res: Response) => {
  // R1 / approved change (vii): logout must clear token_hs so the additive cookie never outlives logout.
  res.append(
    'Set-Cookie',
    `token_hs=; HttpOnly;${secureAttr} SameSite=${sameSite}; Path=/; Max-Age=0`,
  );
};

export const VerifySession = async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token?: unknown };

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    if (typeof token !== 'string') {
      logger.warn('Token no es un string');
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
      logger.warn('Token malformado');
      return res.status(401).json({ error: 'Token malformado' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      name: string;
      email: string;
      role: string;
      permissions: unknown;
    };

    // R3: the /auth/verify admin response keeps the four-field reshape with NO isAdmin.
    const payload = {
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
    };

    if (decoded.email === env.ADMIN_EMAIL) {
      return res.json({
        valid: true,
        user: payload,
      });
    }

    const [customRole] = await pool.query<RowDataPacket[]>(
      'SELECT permissions FROM roles WHERE name = ?',
      [decoded.role],
    );
    const permissions = customRole.length > 0 ? parseJsonColumn(customRole[0]?.permissions) : null;

    return res.json({
      valid: true,
      user: {
        ...payload,
        permissions,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Error al verificar sesión');
    const err = error as Error;
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: err.message || 'Error al verificar la sesión' });
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    if (email === env.ADMIN_EMAIL && (await bcrypt.compare(password, adminHash))) {
      // Additive isAdmin flag (approved change iii); client-visible shape is otherwise unchanged.
      const payload = {
        name: env.ADMIN_NAME,
        email,
        role: env.ADMIN_ROLE,
        permissions: '***',
        isAdmin: true,
      };

      const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });

      setTokenHsCookie(res, token);
      return res.json({
        token,
        user: payload,
      });
    }

    // Approved change (i): reuse getUserByEmail and reorder the !user check BEFORE
    // getPasswordByUserId so an unknown email returns 401 (was a 500 crash + user-enumeration signal).
    const user = await UserModule.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordUser = await UserModule.getPasswordByUserId(user.id);
    if (!passwordUser) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, passwordUser.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const [role] = await pool.query<RowDataPacket[]>(
      'SELECT name, permissions FROM roles WHERE id = ?',
      [user.role_id],
    );
    const permissions = role.length > 0 ? parseJsonColumn(role[0]?.permissions) : null;

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      // characterized 500, see §4.4: deleted-role path -> role is empty -> role[0].name throws (stays 500).
      role: role[0]!.name,
      permissions,
      isAdmin: false,
    };

    const token = jwt.sign(userData, env.JWT_SECRET, { expiresIn: '24h' });

    setTokenHsCookie(res, token);
    return res.json({
      token,
      user: userData,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error al iniciar sesión');
    return res
      .status(500)
      .json({ error: (error as Error).message || 'Error al iniciar sesión' });
  }
};

export const CreateSession = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const isAdmin = email === env.ADMIN_EMAIL && (await bcrypt.compare(password, adminHash));

    if (!isAdmin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // /auth/test keeps its distinct {email,role,permissions:"***"} shape (no name/id). Preserved.
    const payload = {
      email,
      role: env.ADMIN_ROLE,
      permissions: '***',
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      token,
      user: payload,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error al crear sesión');
    return res.status(500).json({ error: (error as Error).message || 'Error al crear sesión' });
  }
};

export const Logout = async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token?: string };

    if (!token) {
      return res.status(400).json({
        error: 'Token no proporcionado',
      });
    }

    try {
      jwt.verify(token, env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        error: 'Token inválido',
      });
    }

    clearTokenHsCookie(res);
    return res.json({
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    logger.error({ err: error }, 'Error al cerrar sesión');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
