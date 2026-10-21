// Seeds a real MySQL database for the characterization harness.
// Rebuilds the schema from src/database/db.sql, then inserts the deterministic fixture.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import mysql from 'mysql2/promise';
import { buildSeedData, IDS } from './fixture.js';
import { runMigrations } from '../../src/database/migrations/002_backfill_submissions.js';
import { pool } from '../../src/database/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_SQL_PATH = resolve(__dirname, '../../src/database/db.sql');

// The trigger body (DELIMITER-wrapped in db.sql) — recreated separately because mysql2 cannot parse
// the DELIMITER directive. Behavior is identical to the db.sql trigger.
const TRIGGER_SQL = `
CREATE TRIGGER before_event_insert
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
    IF NEW.formConfig IS NULL OR JSON_LENGTH(NEW.formConfig) = 0 THEN
        SET NEW.formConfig = JSON_OBJECT(
            'inscriptions', JSON_OBJECT('enabled', false, 'startDate', '', 'endDate', ''),
            'assists', JSON_OBJECT('enabled', false, 'startDate', '', 'endDate', '')
        );
    END IF;
END
`;

function adminConfig() {
  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT ?? 3306),
    multipleStatements: true,
  };
}

/**
 * Rebuilds the schema from db.sql. Strips the DELIMITER/trigger block (recreated separately) and the
 * leading DROP/CREATE/USE DATABASE lines (the target DB name comes from DB_NAME, not hardcoded 'buni').
 */
export async function resetSchema(): Promise<void> {
  const dbName = process.env.DB_NAME ?? 'buni';
  const raw = readFileSync(DB_SQL_PATH, 'utf8');

  // Keep only the CREATE TABLE / DROP TABLE statements, dropping the DELIMITER trigger block and the
  // database-level statements (handled explicitly below so we honor DB_NAME).
  const withoutTrigger = raw.split(/DELIMITER\s*\/\//i)[0] ?? raw;
  const statements = withoutTrigger
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => !/^(DROP|CREATE|USE)\s+DATABASE/i.test(s));

  const conn = await mysql.createConnection(adminConfig());
  try {
    await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await conn.query(`CREATE DATABASE \`${dbName}\``);
    await conn.query(`USE \`${dbName}\``);
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    await conn.query(TRIGGER_SQL);
  } finally {
    await conn.end();
  }
}

/** Inserts the deterministic fixture and then deletes the orphan role to characterize deleted-role paths. */
export async function seedFixture(): Promise<void> {
  const dbName = process.env.DB_NAME ?? 'buni';
  const data = buildSeedData();
  const conn = await mysql.createConnection({ ...adminConfig(), database: dbName });
  try {
    for (const role of data.roles) await conn.query('INSERT INTO roles SET ?', [role]);
    for (const user of data.users) await conn.query('INSERT INTO users SET ?', [user]);
    for (const s of data.sceneries) await conn.query('INSERT INTO sceneries SET ?', [s]);
    for (const p of data.programs) await conn.query('INSERT INTO programs SET ?', [p]);
    for (const f of data.forms) await conn.query('INSERT INTO forms SET ?', [f]);
    for (const e of data.events) await conn.query('INSERT INTO events SET ?', [e]);

    // Delete the orphan role. The FK is ON DELETE SET NULL, so userDeletedRole.role_id becomes NULL.
    // Login then runs `SELECT name, permissions FROM roles WHERE id = NULL` -> empty result ->
    // `role[0].name` throws a TypeError -> characterized 500 (the deleted-role Login path, pinned and
    // preserved per design §0.6 item 1(f)).
    await conn.query('DELETE FROM roles WHERE id = ?', [IDS.roleToDelete]);
  } finally {
    await conn.end();
  }
}

/**
 * Full reset: schema + fixture + Phase-4 migrations (event_submissions + backfill + state index).
 * Called from each test file's beforeAll/beforeEach.
 */
export async function resetDatabase(): Promise<void> {
  await resetSchema();
  await seedFixture();
  // Phase 4: create event_submissions (charset-matched FK), add idx_events_state, backfill the
  // seeded events' legacy inscriptions/assists arrays in order. The fixture seeds empty arrays, so
  // the backfill inserts nothing but the table must exist for the aggregation to read it.
  await runMigrations(pool);
}
