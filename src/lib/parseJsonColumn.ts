/**
 * Centralizes the repeated `typeof x === 'string' ? JSON.parse(x) : x` idiom used across the services
 * for mysql2 JSON columns. Runtime behavior is identical to the inline expression it replaces: a
 * string is parsed, anything else is returned as-is.
 */
export function parseJsonColumn<T>(value: unknown): T {
  return (typeof value === 'string' ? JSON.parse(value) : value) as T;
}
