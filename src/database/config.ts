import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT, // now a number
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  namedPlaceholders: true,
  // NOTE: `timezone` is intentionally NOT set (design §4.1). DATE_FORMAT output is independent of the
  // connection timezone; setting it would only risk raw-Date column (de)serialization for no benefit.
});

/**
 * Fail-fast DB healthcheck. Awaited before server.listen in index.ts; on rejection the entry logs and
 * exits non-zero. Replaces the old error-swallowing IIFE.
 */
export async function assertDbReady(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
