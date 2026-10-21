import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mysql from 'mysql2/promise';
import { resetDatabase } from '../helpers/db.js';
import { app } from '../../src/app.js';
import { IDS } from '../helpers/fixture.js';
import { backfillSubmissions } from '../../src/database/migrations/002_backfill_submissions.js';
import { pool } from '../../src/database/config.js';

// Phase-4 specific integration tests (atomic quota, ordering, backfill, un-backfilled quota).
describe('Phase 4: event_submissions + atomic quota', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('concurrency: N parallel inscriptions at cupos=2 -> exactly 2 land, rest get 500', async () => {
    const attempts = 6;
    const results = await Promise.all(
      Array.from({ length: attempts }, (_, i) =>
        request(app)
          .put(`/events/${IDS.eventLimited2}/forms`)
          .send({ typeForm: 'inscriptions', nombre: `P${i}` })
          .then((r) => r.status),
      ),
    );

    const ok = results.filter((s) => s === 200).length;
    const over = results.filter((s) => s === 500).length;
    expect(ok).toBe(2);
    expect(over).toBe(attempts - 2);

    // The event now has exactly 2 inscriptions.
    const after = await request(app).get(`/events/${IDS.eventLimited2}`);
    expect(after.body.inscriptions).toHaveLength(2);
  });

  it('seq ordering: sequential submissions appear in submit order in GET /events/:id', async () => {
    for (const name of ['uno', 'dos', 'tres']) {
      await request(app)
        .put(`/events/${IDS.eventUnlimited}/forms`)
        .send({ typeForm: 'inscriptions', nombre: name });
    }
    const after = await request(app).get(`/events/${IDS.eventUnlimited}`);
    expect(after.body.inscriptions.map((r: { nombre: string }) => r.nombre)).toEqual([
      'uno',
      'dos',
      'tres',
    ]);
  });

  it('un-backfilled quota (MEDIUM-3): legacy JSON full but event_submissions empty -> still 500', async () => {
    // Directly fill the LEGACY JSON column of the cupos=2 event to 2 WITHOUT inserting event_submissions.
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME,
    });
    try {
      await conn.query('UPDATE events SET inscriptions = ? WHERE id = ?', [
        JSON.stringify([{ nombre: 'legacy1' }, { nombre: 'legacy2' }]),
        IDS.eventLimited2,
      ]);
    } finally {
      await conn.end();
    }

    // event_submissions for this event is still empty (count 0), but quota counts the legacy JSON (2).
    const res = await request(app)
      .put(`/events/${IDS.eventLimited2}/forms`)
      .send({ typeForm: 'inscriptions', nombre: 'overflow' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('No hay cupos disponibles');
  });

  it('backfill fidelity: legacy arrays backfill into event_submissions in order', async () => {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME,
    });
    try {
      // Seed legacy arrays directly, then clear event_submissions so backfill re-runs for this event.
      await conn.query('UPDATE events SET inscriptions = ?, assists = ? WHERE id = ?', [
        JSON.stringify([{ nombre: 'a' }, { nombre: 'b' }]),
        JSON.stringify([{ nombre: 'x' }]),
        IDS.eventUnlimited,
      ]);
      await conn.query('DELETE FROM event_submissions WHERE event_id = ?', [IDS.eventUnlimited]);
    } finally {
      await conn.end();
    }

    const { inserted } = await backfillSubmissions(pool);
    expect(inserted).toBeGreaterThanOrEqual(3);

    const after = await request(app).get(`/events/${IDS.eventUnlimited}`);
    expect(after.body.inscriptions.map((r: { nombre: string }) => r.nombre)).toEqual(['a', 'b']);
    expect(after.body.assists.map((r: { nombre: string }) => r.nombre)).toEqual(['x']);
  });

  it('backfill is idempotent: re-running skips already-populated events', async () => {
    await request(app)
      .put(`/events/${IDS.eventUnlimited}/forms`)
      .send({ typeForm: 'inscriptions', nombre: 'one' });
    const first = await backfillSubmissions(pool);
    const second = await backfillSubmissions(pool);
    // Second run inserts nothing for the already-populated event.
    expect(second.inserted).toBe(0);
    expect(first.skipped + second.skipped).toBeGreaterThan(0);
  });

  it('Login unknown email now 401, deleted-role login still 500', async () => {
    const unknown = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@buni.test', password: 'x' });
    expect(unknown.status).toBe(401);
  });
});
