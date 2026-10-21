// Normalizes volatile fields (fresh UUIDs, timestamps, JWTs, bcrypt hashes) to stable placeholders
// so snapshots are deterministic across runs. Structure and non-volatile values are preserved.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
// ISO-ish timestamps like 2025-01-01T09:00:00.000Z or 2025-01-01 09:00:00
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;

const VOLATILE_KEYS = new Set(['created_at', 'date_now', 'token', 'seq']);

function normalizeString(value: string): string {
  if (JWT_RE.test(value)) return '<jwt>';
  if (BCRYPT_RE.test(value)) return '<bcrypt-hash>';
  if (UUID_RE.test(value)) return '<uuid>';
  if (TIMESTAMP_RE.test(value)) return '<timestamp>';
  return value;
}

export function normalize(input: unknown): unknown {
  if (typeof input === 'string') return normalizeString(input);
  if (Array.isArray(input)) return input.map((v) => normalize(v));
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      if (VOLATILE_KEYS.has(key)) {
        out[key] = val === null || val === undefined ? val : `<${key}>`;
      } else {
        out[key] = normalize(val);
      }
    }
    return out;
  }
  return input;
}

/** Produces the normalized {status, body} record snapshotted for each HTTP case. */
export function snapshotResponse(res: { status: number; body: unknown }): {
  status: number;
  body: unknown;
} {
  return { status: res.status, body: normalize(res.body) };
}
