import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { normalize, snapshotResponse } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { IDS, CUSTOM_PERMISSIONS } from '../helpers/fixture.js';
import { adminToken } from '../helpers/tokens.js';

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('roles endpoints', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('GET /roles -> bare array', async () => {
    const res = await request(app).get('/roles').set(bearer(adminToken()));
    const sorted = [...res.body].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    expect({ status: res.status, body: normalize(sorted) }).toMatchSnapshot();
  });

  it('POST /roles -> 201 {message,data}', async () => {
    const res = await request(app)
      .post('/roles')
      .set(bearer(adminToken()))
      .send({ name: 'nuevo-rol', permissions: CUSTOM_PERMISSIONS });
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('POST /roles missing fields -> 400 Se requieren nombre y permisos', async () => {
    const res = await request(app).post('/roles').set(bearer(adminToken())).send({ name: 'x' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('POST /roles duplicate name -> current 500 Ya existe un rol con ese nombre (preserved)', async () => {
    const res = await request(app)
      .post('/roles')
      .set(bearer(adminToken()))
      .send({ name: 'coordinador', permissions: CUSTOM_PERMISSIONS });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /roles/:id -> 200 {message,data:true}', async () => {
    const res = await request(app)
      .put(`/roles/${IDS.roleCustom}`)
      .set(bearer(adminToken()))
      .send({ name: 'coordinador', permissions: CUSTOM_PERMISSIONS });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /roles/:id not found -> 400 no encontrado', async () => {
    const res = await request(app)
      .put('/roles/missing-id')
      .set(bearer(adminToken()))
      .send({ name: 'x', permissions: CUSTOM_PERMISSIONS });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('PUT /roles/:id duplicate name -> current 500 (preserved)', async () => {
    // Rename roleCustom ('coordinador') to an existing different role name. Only one custom role
    // remains after the orphan delete, so create a second role first, then collide.
    await request(app)
      .post('/roles')
      .set(bearer(adminToken()))
      .send({ name: 'otro-rol', permissions: CUSTOM_PERMISSIONS });
    const res = await request(app)
      .put(`/roles/${IDS.roleCustom}`)
      .set(bearer(adminToken()))
      .send({ name: 'otro-rol', permissions: CUSTOM_PERMISSIONS });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /roles/:id (unused role) -> 200 {message,deletedRole}', async () => {
    // roleCustom is used by userNormal; create a fresh unused role to delete cleanly.
    const created = await request(app)
      .post('/roles')
      .set(bearer(adminToken()))
      .send({ name: 'rol-borrable', permissions: CUSTOM_PERMISSIONS });
    const res = await request(app)
      .delete(`/roles/${created.body.data.id}`)
      .set(bearer(adminToken()));
    expect({ status: res.status, body: normalize(res.body) }).toMatchSnapshot();
  });

  it('DELETE /roles/:id not found -> 400 no encontrado', async () => {
    const res = await request(app).delete('/roles/missing-id').set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /roles/:id in use -> 400 utilizando', async () => {
    const res = await request(app).delete(`/roles/${IDS.roleCustom}`).set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});
