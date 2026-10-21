import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { normalize, snapshotResponse } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { IDS } from '../helpers/fixture.js';
import { adminToken } from '../helpers/tokens.js';

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('users endpoints', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('GET /users -> bare array (no password), admin', async () => {
    const res = await request(app).get('/users').set(bearer(adminToken()));
    const sorted = [...res.body].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    expect({ status: res.status, body: normalize(sorted) }).toMatchSnapshot();
  });

  it('GET /users/data -> aggregate {events,programs,scenery,users,forms,roles}', async () => {
    const res = await request(app).get('/users/data').set(bearer(adminToken()));
    expect(res.status).toBe(200);
    // Pin the top-level key set (the shape Phase 4 parallelizes), not volatile row contents.
    expect(Object.keys(res.body).sort()).toMatchSnapshot();
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(Array.isArray(res.body.roles)).toBe(true);
  });

  it('POST /users -> 201 {message,data}', async () => {
    const res = await request(app)
      .post('/users')
      .set(bearer(adminToken()))
      .send({
        name: 'Nuevo Usuario',
        email: 'nuevo@buni.test',
        password: 'secret1234',
        roles: { id: IDS.roleCustom },
      });
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('PUT /users/:id -> 200 {message,data:true}', async () => {
    const res = await request(app)
      .put(`/users/${IDS.userNormal}`)
      .set(bearer(adminToken()))
      .send({ name: 'Usuario Normal', email: 'normal@buni.test', roles: { id: IDS.roleCustom } });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /users/:id -> 200 {message,data:true}', async () => {
    const res = await request(app).delete(`/users/${IDS.userNormal}`).set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});
