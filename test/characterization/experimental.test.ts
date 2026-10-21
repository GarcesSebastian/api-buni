import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDatabase } from '../helpers/db.js';
import { snapshotResponse } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { adminToken } from '../helpers/tokens.js';

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

// §0.6 item 14: /experimental dev behavior. These run only in the non-prod test config.
describe('/experimental (dev-only)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('DELETE /experimental/scenery -> 200 working delete (approved change iv: scenery->sceneries)', async () => {
    const res = await request(app).delete('/experimental/scenery').set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('DELETE /experimental/programs -> 200 success (representative working delete)', async () => {
    const res = await request(app).delete('/experimental/programs').set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });
});
