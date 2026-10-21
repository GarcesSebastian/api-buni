import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { snapshotResponse, normalize } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { IDS } from '../helpers/fixture.js';
import { adminToken, normalUserToken, deletedRoleToken } from '../helpers/tokens.js';

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

// A complete, valid event body for create/update happy paths.
const validEventBody = (over: Record<string, unknown> = {}) => ({
  nombre: 'Nuevo Evento',
  organizador: 'Org',
  scenery: { id: IDS.sceneryA },
  programs: { id: IDS.programA },
  cupos: '10',
  horarioInicio: '2025-02-01 09:00:00',
  horarioFin: '2025-02-01 12:00:00',
  state: 'active',
  formAssists: { id: IDS.formAssists },
  formInscriptions: { id: IDS.formInscriptions },
  assists: [],
  inscriptions: [],
  formConfig: {},
  ...over,
});

describe('GET /events', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('bare array; one full event shape + zero-submission event present with [] arrays', async () => {
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Sort by id for determinism, then snapshot the normalized array.
    const sorted = [...res.body].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    expect({ status: res.status, body: normalize(sorted) }).toMatchSnapshot();
    // Explicit zero-submission assertion (the cupos=0 fixture event).
    const zero = res.body.find((e: { id: string }) => e.id === IDS.eventZero);
    expect(zero.inscriptions).toEqual([]);
    expect(zero.assists).toEqual([]);
  });
});

describe('GET /events/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('existing -> bare object', async () => {
    const res = await request(app).get(`/events/${IDS.eventUnlimited}`);
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('missing -> current 500 (events never 404)', async () => {
    const res = await request(app).get('/events/does-not-exist');
    expect(res.status).toMatchSnapshot();
  });
});

describe('PUT /events/:id/forms (quota + submissions)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('(a) inscription into cupos=-1 -> 200 data:true, appended in order', async () => {
    const res = await request(app)
      .put(`/events/${IDS.eventUnlimited}/forms`)
      .send({ typeForm: 'inscriptions', nombre: 'Persona 1' });
    expect(snapshotResponse(res)).toMatchSnapshot();

    const after = await request(app).get(`/events/${IDS.eventUnlimited}`);
    expect(normalize(after.body.inscriptions)).toMatchSnapshot();
  });

  it('(b) fill cupos=2 to 2, then 3rd -> 500 No hay cupos disponibles', async () => {
    await request(app)
      .put(`/events/${IDS.eventLimited2}/forms`)
      .send({ typeForm: 'inscriptions', nombre: 'P1' });
    await request(app)
      .put(`/events/${IDS.eventLimited2}/forms`)
      .send({ typeForm: 'inscriptions', nombre: 'P2' });
    const third = await request(app)
      .put(`/events/${IDS.eventLimited2}/forms`)
      .send({ typeForm: 'inscriptions', nombre: 'P3' });
    expect(snapshotResponse(third)).toMatchSnapshot();
  });

  it('(c) cupos=0 inscription -> 500 No hay cupos disponibles', async () => {
    const res = await request(app)
      .put(`/events/${IDS.eventZero}/forms`)
      .send({ typeForm: 'inscriptions', nombre: 'P1' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(d) assists submission (no cupos check) -> appended', async () => {
    const res = await request(app)
      .put(`/events/${IDS.eventZero}/forms`)
      .send({ typeForm: 'assists', nombre: 'A1' });
    expect(snapshotResponse(res)).toMatchSnapshot();
    const after = await request(app).get(`/events/${IDS.eventZero}`);
    expect(normalize(after.body.assists)).toMatchSnapshot();
  });

  it('(e) unknown typeForm -> 200 no-op success, arrays unchanged', async () => {
    const res = await request(app)
      .put(`/events/${IDS.eventUnlimited}/forms`)
      .send({ typeForm: 'garbage', foo: 'bar' });
    expect(snapshotResponse(res)).toMatchSnapshot();
    const after = await request(app).get(`/events/${IDS.eventUnlimited}`);
    expect(after.body.inscriptions).toEqual([]);
    expect(after.body.assists).toEqual([]);
  });
});

describe('events CRUD happy paths', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('POST /events -> 201 {message,data}', async () => {
    const res = await request(app)
      .post('/events')
      .set(bearer(adminToken()))
      .send(validEventBody());
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('POST /events with falsy state (state:false) -> current 201 success', async () => {
    const res = await request(app)
      .post('/events')
      .set(bearer(adminToken()))
      .send(validEventBody({ state: false }));
    expect(res.status).toMatchSnapshot();
  });

  it('POST /events cupos:"0" and cupos:"-1" -> current 201', async () => {
    const r0 = await request(app)
      .post('/events')
      .set(bearer(adminToken()))
      .send(validEventBody({ cupos: '0' }));
    const rNeg = await request(app)
      .post('/events')
      .set(bearer(adminToken()))
      .send(validEventBody({ cupos: '-1' }));
    expect([r0.status, rNeg.status]).toMatchSnapshot();
  });

  it('POST /events cupos:"" -> current 400/throw', async () => {
    const res = await request(app)
      .post('/events')
      .set(bearer(adminToken()))
      .send(validEventBody({ cupos: '' }));
    expect(res.status).toMatchSnapshot();
  });

  it('PUT /events/:id -> 200 data:true', async () => {
    const res = await request(app)
      .put(`/events/${IDS.eventUnlimited}`)
      .set(bearer(adminToken()))
      .send(validEventBody());
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /events/:id/form-config -> 200 data:true', async () => {
    const res = await request(app)
      .put(`/events/${IDS.eventUnlimited}/form-config`)
      .set(bearer(adminToken()))
      .send({ inscriptions: { enabled: true, startDate: '', endDate: '' }, assists: { enabled: false, startDate: '', endDate: '' } });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /events/:id -> 200 data:true', async () => {
    const res = await request(app)
      .delete(`/events/${IDS.eventZero}`)
      .set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});

describe('events permission chain (verifyToken runs first)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('(a) no Authorization header -> 401 Token no proporcionado', async () => {
    const res = await request(app).post('/events').send(validEventBody());
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(b) invalid token -> 401 Token inválido', async () => {
    const res = await request(app)
      .post('/events')
      .set(bearer('aaaa.bbbb.cccc'))
      .send(validEventBody());
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(c) valid token lacking events.create (PUT -> edit denied) -> 401 message', async () => {
    // The custom role has events.create=true but edit=false; PUT hits updateEventMiddleware.
    const res = await request(app)
      .put(`/events/${IDS.eventUnlimited}`)
      .set(bearer(normalUserToken()))
      .send(validEventBody());
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(d) valid token whose role row is missing (deleted role) -> 401 (approved change ii)', async () => {
    // Phase 3: requirePermission reads the role from the DB; a deleted role -> clean 401 with the
    // verbatim per-action message (approved change ii; was a 500/crash in earlier phases).
    const res = await request(app)
      .post('/events')
      .set(bearer(deletedRoleToken()))
      .send(validEventBody());
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(e) admin token -> reaches controller (201)', async () => {
    const res = await request(app)
      .post('/events')
      .set(bearer(adminToken()))
      .send(validEventBody());
    expect(res.status).toMatchSnapshot();
  });

  it('DELETE denied message for custom role', async () => {
    const res = await request(app)
      .delete(`/events/${IDS.eventUnlimited}`)
      .set(bearer(normalUserToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});
