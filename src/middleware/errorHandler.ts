import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError.js';

/**
 * Central error handler, registered LAST in app.ts. It reproduces the per-controller contract:
 * - AppError -> its own status + message.
 * - JWT errors -> 401 with the verbatim Spanish messages.
 * - Zod errors (enforce mode) -> 400 with the first issue message.
 * - anything else -> 500 { error: message }.
 *
 * With the Phase-2 controllers still catching their own errors (unchanged), this handler is an
 * additive safety net and does not alter any Phase-0 snapshot.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  const e = err as Error;
  if (e?.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }
  if (e?.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }

  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({ error: first?.message ?? 'Datos inválidos' });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: e?.message ?? 'Internal Server Error' });
};
