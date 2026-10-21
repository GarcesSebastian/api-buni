// Idempotent migration runner for event_submissions:
//  1) create the event_submissions table with an FK whose charset/collation MATCHES events.id
//     (read dynamically via SHOW FULL COLUMNS so the FK never fails on a non-default charset);
//  2) add idx_events_state if missing;
//  3) backfill one row per legacy inscriptions/assists array element IN ORDER so AUTO_INCREMENT seq
//     equals the original append order; skip any event that already has submissions.
// The legacy events.inscriptions/assists JSON columns are kept (dual-write window).
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

interface ColumnInfo extends RowDataPacket {
  Field: string;
  Collation: string | null;
}

async function getIdCharsetCollation(pool: Pool): Promise<{ charset: string; collation: string }> {
  const [cols] = await pool.query<ColumnInfo[]>("SHOW FULL COLUMNS FROM events LIKE 'id'");
  const collation = cols[0]?.Collation ?? 'utf8mb4_0900_ai_ci';
  const charset = collation.split('_')[0] ?? 'utf8mb4';
  return { charset, collation };
}

async function tableExists(pool: Pool, table: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
    [table],
  );
  return ((rows[0]?.c as number) ?? 0) > 0;
}

async function indexExists(pool: Pool, table: string, index: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS c FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?',
    [table, index],
  );
  return ((rows[0]?.c as number) ?? 0) > 0;
}

export async function ensureEventSubmissions(pool: Pool): Promise<void> {
  if (await tableExists(pool, 'event_submissions')) return;

  const { charset, collation } = await getIdCharsetCollation(pool);
  await pool.query(`
    CREATE TABLE event_submissions (
      seq        BIGINT NOT NULL AUTO_INCREMENT,
      id         VARCHAR(255) NOT NULL,
      event_id   VARCHAR(255) CHARACTER SET ${charset} COLLATE ${collation} NOT NULL,
      type       ENUM('inscription','assist') NOT NULL,
      data       JSON NOT NULL,
      created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (seq),
      UNIQUE KEY uq_submission_id (id),
      CONSTRAINT fk_event_submissions_event FOREIGN KEY (event_id)
        REFERENCES events(id) ON DELETE CASCADE,
      KEY idx_event_type_seq (event_id, type, seq)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

export async function ensureStateIndex(pool: Pool): Promise<void> {
  if (await indexExists(pool, 'events', 'idx_events_state')) return;
  await pool.query('CREATE INDEX idx_events_state ON events (state)');
}

function parseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function backfillSubmissions(pool: Pool): Promise<{ inserted: number; skipped: number }> {
  const [events] = await pool.query<RowDataPacket[]>(
    'SELECT id, inscriptions, assists FROM events',
  );

  let inserted = 0;
  let skipped = 0;

  for (const event of events) {
    const eventId = event.id as string;
    const [[countRow]] = (await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS c FROM event_submissions WHERE event_id = ?',
      [eventId],
    )) as unknown as [RowDataPacket[]];
    if (((countRow?.c as number) ?? 0) > 0) {
      skipped += 1;
      continue; // already populated — idempotent skip
    }

    // Insert inscriptions then assists in array order so seq follows the original append order.
    const inscriptions = parseArray(event.inscriptions);
    for (const element of inscriptions) {
      await pool.query('INSERT INTO event_submissions SET ?', [
        { id: uuidv4(), event_id: eventId, type: 'inscription', data: JSON.stringify(element) },
      ]);
      inserted += 1;
    }
    const assists = parseArray(event.assists);
    for (const element of assists) {
      await pool.query('INSERT INTO event_submissions SET ?', [
        { id: uuidv4(), event_id: eventId, type: 'assist', data: JSON.stringify(element) },
      ]);
      inserted += 1;
    }
  }

  return { inserted, skipped };
}

export async function runMigrations(pool: Pool): Promise<void> {
  await ensureEventSubmissions(pool);
  await ensureStateIndex(pool);
  await backfillSubmissions(pool);
}
