import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { pool } from '../database/config.js';

export interface SubmissionRow {
  event_id: string;
  type: 'inscription' | 'assist';
  data: unknown;
}

/** All submissions for a set of event ids, ordered by seq (append order). */
const getByEventIds = async (eventIds: string[]): Promise<SubmissionRow[]> => {
  if (eventIds.length === 0) return [];
  const placeholders = eventIds.map(() => '?').join(', ');
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT event_id, type, data FROM event_submissions WHERE event_id IN (${placeholders}) ORDER BY seq`,
    eventIds,
  );
  return rows as unknown as SubmissionRow[];
};

/** All submissions for a single event, ordered by seq. */
const getByEventId = async (eventId: string): Promise<SubmissionRow[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT event_id, type, data FROM event_submissions WHERE event_id = ? ORDER BY seq',
    [eventId],
  );
  return rows as unknown as SubmissionRow[];
};

/** Inserts a submission within a transaction connection. */
const insert = async (
  conn: PoolConnection,
  row: { id: string; event_id: string; type: 'inscription' | 'assist'; data: string },
): Promise<void> => {
  await conn.query('INSERT INTO event_submissions SET ?', [row]);
};

export class SubmissionsModule {
  static getByEventIds = getByEventIds;
  static getByEventId = getByEventId;
  static insert = insert;
}
