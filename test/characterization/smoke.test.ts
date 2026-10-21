import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { app } from '../../src/app.js';

describe('smoke', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  it('root endpoint responds', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ buni: 'Estamos conectados uwu' });
  });

  it('GET /events returns a bare array of the three fixture events', async () => {
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(3);
  });
});
