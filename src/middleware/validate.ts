import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../lib/AppError.js';

interface ValidateSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  /** When true this route enforces (rejects) even in global parse-and-log mode. */
  enforce?: boolean;
}

/**
 * validate(schemas) — two modes controlled by env.ZOD_ENFORCE (default false):
 *  - parse-and-log (default): on failure, log the issues and call next() with the UNMODIFIED request.
 *    On success, attach req.validated but do NOT mutate req.body observably. Zero behavior change.
 *  - enforce: on failure, throw AppError(400, firstMessage). Enabled per-route via the allowlist or
 *    the schemas.enforce flag only after logs confirm the frontend sends compliant payloads.
 *
 * The public PUT /events/:id/forms route always stays parse-and-log for typeForm (never enforced).
 */
export function validate(schemas: ValidateSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const enforce = env.ZOD_ENFORCE || schemas.enforce === true;
    const validated: { body?: unknown; params?: unknown; query?: unknown } = {};

    for (const key of ['body', 'params', 'query'] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (result.success) {
        validated[key] = result.data;
        continue;
      }

      if (enforce) {
        const firstMessage = (result.error as ZodError).issues[0]?.message ?? 'Datos inválidos';
        return next(new AppError(400, firstMessage));
      }

      // parse-and-log: record the violation and continue with the request unchanged.
      console.warn(
        JSON.stringify({
          level: 'warn',
          msg: 'zod validation (parse-and-log)',
          route: `${req.method} ${req.originalUrl}`,
          target: key,
          issues: (result.error as ZodError).issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        }),
      );
    }

    req.validated = validated;
    next();
  };
}
