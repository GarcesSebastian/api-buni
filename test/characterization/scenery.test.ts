import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { normalize, snapshotResponse } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { IDS } from '../helpers/fixture.js';
import { adminToken } from '../helpers/tokens.js';

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('scenery endpoints', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('GET /scenery -> bare array (public)', async () => {
    const res = await request(app).get('/scenery');
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('GET /scenery/:id existing -> bare object', async () => {
    const res = await request(app).get(`/scenery/${IDS.sceneryA}`);
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('GET /scenery/<missing> -> current 500 generic (no 404)', async () => {
    const res = await request(app).get('/scenery/missing-id');
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('POST /scenery -> 201 {message,data}', async () => {
    const res = await request(app)
      .post('/scenery')
      .set(bearer(adminToken()))
      .send({ name: 'Escenario Nuevo', state: 'active' });
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('POST /scenery missing fields -> 400 Todos los campos son requeridos', async () => {
    const res = await request(app).post('/scenery').set(bearer(adminToken())).send({ name: 'x' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('POST /scenery falsy state (state:"") -> current 400 Todos los campos son requeridos', async () => {
    const res = await request(app)
      .post('/scenery')
      .set(bearer(adminToken()))
      .send({ name: 'Escenario Falsy', state: '' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('POST /scenery duplicate name -> current 500 generic (preserved)', async () => {
    const res = await request(app)
      .post('/scenery')
      .set(bearer(adminToken()))
      .send({ name: 'Escenario A', state: 'active' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /scenery/<missing> -> current 400 Escenario no encontrado', async () => {
    const res = await request(app)
      .put('/scenery/missing-id')
      .set(bearer(adminToken()))
      .send({ name: 'x', state: 'active' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /scenery/<missing> -> current 400 Escenario no encontrado', async () => {
    const res = await request(app).delete('/scenery/missing-id').set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /scenery/:id existing -> 200 {message,data:true}', async () => {
    const res = await request(app)
      .put(`/scenery/${IDS.sceneryA}`)
      .set(bearer(adminToken()))
      .send({ name: 'Escenario A', state: 'inactive' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /scenery/:id existing -> 200 {message,data:true}', async () => {
    const res = await request(app).delete(`/scenery/${IDS.sceneryA}`).set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});
