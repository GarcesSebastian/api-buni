import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { rmSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import request from 'supertest';
import XLSX from 'xlsx';
import { snapshotResponse } from '../helpers/normalize.js';
import { app } from '../../src/app.js';
import { adminToken } from '../helpers/tokens.js';

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

const UPLOADS = resolve(process.cwd(), 'uploads');
const FIXTURE_XLSX = 'characterization-fixture.xlsx';

describe('GET /files/upload/:name (Phase 3: authed + sanitized)', () => {
  beforeAll(() => {
    mkdirSync(UPLOADS, { recursive: true });
    // Build a tiny deterministic .xlsx with one sheet.
    const ws = XLSX.utils.json_to_sheet([{ nombre: 'Ana', edad: 30 }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
    XLSX.writeFile(wb, resolve(UPLOADS, FIXTURE_XLSX));
  });

  afterAll(() => {
    rmSync(resolve(UPLOADS, FIXTURE_XLSX), { force: true });
  });

  it('authorized valid seeded .xlsx -> 200 bare sheet JSON (success shape preserved)', async () => {
    const res = await request(app).get(`/files/upload/${FIXTURE_XLSX}`).set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('no auth -> 401 (Phase 3 hardening)', async () => {
    const res = await request(app).get(`/files/upload/${FIXTURE_XLSX}`);
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('authorized missing file -> 404 (Phase 3: no longer a path-leaking 500)', async () => {
    const res = await request(app)
      .get('/files/upload/does-not-exist.xlsx')
      .set(bearer(adminToken()));
    expect(snapshotResponse(res)).toMatchSnapshot();
  });

  it('authorized path traversal attempt -> 400 (confinement)', async () => {
    const res = await request(app)
      .get('/files/upload/' + encodeURIComponent('../package.json'))
      .set(bearer(adminToken()));
    expect(res.status).toMatchSnapshot();
  });
});
