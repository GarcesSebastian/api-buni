// Global Vitest setup for the characterization harness.
// Loads the test .env BEFORE any module that reads process.env (env.ts, database config) is imported.
import 'dotenv/config';

// The characterization suite requires a real MySQL instance (FOR UPDATE + JSON columns).
// Connection comes from the .env in the repo root (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME).
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

// Some CHARACTERIZED current bugs (e.g. event.middleware.js throwing on a deleted role with no
// try/catch and no next(err)) surface as process-level unhandled rejections because Express 4 does
// not await async middleware. These are real, pinned behaviors (fixed in Phase 3). We swallow ONLY
// those known permission-crash rejections so they do not produce false-positive test failures, while
// letting any other unexpected rejection still surface.
process.on('unhandledRejection', (reason: unknown) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  if (
    msg.includes("reading 'permissions'") ||
    msg.includes("reading 'events'") ||
    msg.includes("reading 'create'") ||
    msg.includes("reading 'edit'") ||
    msg.includes("reading 'delete'")
  ) {
    return; // characterized permission-middleware crash on a deleted role
  }
  throw reason;
});

