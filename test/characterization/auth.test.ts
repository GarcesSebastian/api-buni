import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { snapshotResponse } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { NORMAL_USER_PASSWORD } from '../helpers/fixture.js';
import { adminToken, normalUserToken, deletedRoleToken, expiredToken } from '../helpers/tokens.js';

// §0.6 item 1-3: auth contract (login / verify / logout / test).
describe('POST /auth/login', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  it('(a) admin creds -> 200 admin user shape (additive isAdmin + token_hs cookie)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    expect(snapshotResponse(res)).toMatchSnapshot();
    // Approved change (iii): additive isAdmin on the admin user; body otherwise unchanged.
    expect(res.body.user.isAdmin).toBe(true);
    // Additive HttpOnly token_hs handshake cookie set on login.
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
    expect(setCookie?.some((c) => c.startsWith('token_hs='))).toBe(true);
  });

  it('(b) valid normal user -> 200 normal user shape', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'normal@buni.test', password: NORMAL_USER_PASSWORD });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(c) wrong password -> 401 Credenciales inválidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'normal@buni.test', password: 'wrong-password' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(d) missing fields -> 400 Email y contraseña son requeridos', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'normal@buni.test' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(e) unknown email -> 401 Credenciales inválidas (approved change i, Phase 4)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@buni.test', password: 'whatever' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(f) known user with deleted role -> current 500 (stays 500)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'sinrol@buni.test', password: NORMAL_USER_PASSWORD });
    expect(res.status).toMatchSnapshot();
  });
});

describe('POST /auth/verify', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  it('valid admin token -> 200 {valid,user}', async () => {
    const res = await request(app).post('/auth/verify').send({ token: adminToken() });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('valid normal token -> 200 {valid,user}', async () => {
    const res = await request(app).post('/auth/verify').send({ token: normalUserToken() });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('no token -> 401 Token no proporcionado', async () => {
    const res = await request(app).post('/auth/verify').send({});
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('non-string token -> 401 Formato de token inválido', async () => {
    const res = await request(app).post('/auth/verify').send({ token: 12345 });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(a) malformed-format token -> 401 Token malformado (bespoke regex branch)', async () => {
    const res = await request(app).post('/auth/verify').send({ token: 'not a jwt at all %%%' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('invalid JWT (bad signature) -> 401 Token inválido', async () => {
    const res = await request(app)
      .post('/auth/verify')
      .send({ token: 'aaaa.bbbb.cccc' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('expired token -> 401 Token expirado', async () => {
    const res = await request(app).post('/auth/verify').send({ token: expiredToken() });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('(b) valid-signature non-admin token with deleted role -> 200 permissions:null (no crash)', async () => {
    const res = await request(app).post('/auth/verify').send({ token: deletedRoleToken() });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});

describe('POST /auth/logout', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  it('valid token -> 200 Sesión cerrada exitosamente (clears token_hs — approved change vii)', async () => {
    const res = await request(app).post('/auth/logout').send({ token: normalUserToken() });
    expect(snapshotResponse(res)).toMatchSnapshot();
    // R1 / approved change (vii): logout clears token_hs via Max-Age=0.
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
    expect(setCookie?.some((c) => c.startsWith('token_hs=') && c.includes('Max-Age=0'))).toBe(true);
  });

  it('no token -> 400 Token no proporcionado', async () => {
    const res = await request(app).post('/auth/logout').send({});
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('invalid token -> 401 Token inválido', async () => {
    const res = await request(app).post('/auth/logout').send({ token: 'aaaa.bbbb.cccc' });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});

describe('POST /auth/test (CreateSession)', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  it('admin creds -> 200 {token,user:{email,role,permissions}} (no name/id)', async () => {
    const res = await request(app)
      .post('/auth/test')
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('non-admin -> 401 Credenciales inválidas', async () => {
    const res = await request(app)
      .post('/auth/test')
      .send({ email: 'normal@buni.test', password: NORMAL_USER_PASSWORD });
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('missing fields -> 400 Email y contraseña son requeridos', async () => {
    const res = await request(app).post('/auth/test').send({});
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});
