import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { normalize, snapshotResponse } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { IDS } from '../helpers/fixture.js';
import { adminToken } from '../helpers/tokens.js';

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('programs endpoints (not-found DIVERGES from scenery: 500 not 400)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('GET /programs -> bare array (public)', async () => {
    const res = await request(app).get('/programs');
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('GET /programs/:id existing -> bare object', async () => {
    const res = await request(app).get(`/programs/${IDS.programA}`);
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('GET /programs/<missing> -> current 500 generic (no 404)', async () => {
    const res = await request(app).get('/programs/missing-id');
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('POST /programs -> 201 {message,data}', async () => {
    const res = await request(app)
      .post('/programs')
      .set(bearer(adminToken()))
      .send({ name: 'Programa Nuevo', state: 'active' });
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('POST /programs missing fields -> 400 Todos los campos son requeridos', async () => {
    const res = await request(app).post('/programs').set(bearer(adminToken())).send({ name: 'x' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('POST /programs duplicate name -> current 500 generic (preserved)', async () => {
    const res = await request(app)
      .post('/programs')
      .set(bearer(adminToken()))
      .send({ name: 'Programa A', state: 'active' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /programs/<missing> -> current 500 generic (NOT 400 — diverges from scenery)', async () => {
    const res = await request(app)
      .put('/programs/missing-id')
      .set(bearer(adminToken()))
      .send({ name: 'x', state: 'active' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /programs/<missing> -> current 500 generic (NOT 400 — diverges from scenery)', async () => {
    const res = await request(app).delete('/programs/missing-id').set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /programs/:id existing -> 200 {message,data:true}', async () => {
    const res = await request(app)
      .put(`/programs/${IDS.programA}`)
      .set(bearer(adminToken()))
      .send({ name: 'Programa A', state: 'inactive' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /programs/:id existing -> 200 {message,data:true}', async () => {
    const res = await request(app).delete(`/programs/${IDS.programA}`).set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});
