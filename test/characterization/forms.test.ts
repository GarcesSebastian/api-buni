import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { normalize, snapshotResponse } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { IDS } from '../helpers/fixture.js';
import { adminToken } from '../helpers/tokens.js';

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('forms endpoints', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('GET /forms -> bare array (public)', async () => {
    const res = await request(app).get('/forms');
    const sorted = [...res.body].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    expect({ status: res.status, body: normalize(sorted) }).toMatchSnapshot();
  });

  it('GET /forms/:id -> {message,data}', async () => {
    const res = await request(app).get(`/forms/${IDS.formInscriptions}`);
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('GET /forms/<missing> (GetFormById) -> 404 no encontrado', async () => {
    const res = await request(app).get('/forms/missing-id');
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('GET /forms/:type/:id (GetFormData) -> bare {event,form,scenery,date_now,current}', async () => {
    const res = await request(app).get(`/forms/formInscriptions/${IDS.eventUnlimited}`);
    expect(res.status).toBe(200);
    // Pin the key set + current (0 from legacy JSON length) + assists/inscriptions undefined.
    expect(Object.keys(res.body).sort()).toMatchSnapshot();
    expect(res.body.current).toMatchSnapshot();
    expect(res.body.event.inscriptions).toBeUndefined();
    expect(res.body.event.assists).toBeUndefined();
  });

  it('GET /forms/:type/<missing> (GetFormData not-found) -> current 500 (no 404)', async () => {
    const res = await request(app).get('/forms/formInscriptions/missing-event');
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('POST /forms -> 201 {message,data}', async () => {
    const res = await request(app)
      .post('/forms')
      .set(bearer(adminToken()))
      .send({
        name: 'Formulario Nuevo',
        description: 'desc',
        fields: [{ name: 'x', type: 'text' }],
        state: 'active',
      });
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('POST /forms duplicate name -> current 500 Ya existe un formulario con ese nombre (preserved)', async () => {
    const res = await request(app)
      .post('/forms')
      .set(bearer(adminToken()))
      .send({
        name: 'Formulario de inscripción',
        description: 'desc',
        fields: [{ name: 'x', type: 'text' }],
        state: 'active',
      });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('POST /forms missing fields -> 400 requeridos', async () => {
    const res = await request(app)
      .post('/forms')
      .set(bearer(adminToken()))
      .send({ name: 'x' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /forms/<missing> -> 404 no encontrado', async () => {
    const res = await request(app)
      .put('/forms/missing-id')
      .set(bearer(adminToken()))
      .send({ name: 'x', description: 'd', fields: [{ name: 'x', type: 'text' }], state: 'active' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /forms/:id existing -> 200 {message,data:true}', async () => {
    const res = await request(app)
      .put(`/forms/${IDS.formInscriptions}`)
      .set(bearer(adminToken()))
      .send({
        name: 'Formulario de inscripción',
        description: 'desc actualizada',
        fields: [{ name: 'x', type: 'text' }],
        state: 'active',
      });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /forms/<missing> -> 404 no encontrado', async () => {
    const res = await request(app).delete('/forms/missing-id').set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /forms/:id existing -> 200 {message,data:true}', async () => {
    const res = await request(app).delete(`/forms/${IDS.formAssists}`).set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});
