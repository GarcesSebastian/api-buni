import type { JwtUser } from './domain.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
      // Populated by the Phase-2 validate() middleware (parse-and-log mode attaches parsed input).
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export {};
