import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Socket } from 'socket.io-client';
import {
  startSocketServer,
  connectClient,
  waitConnect,
  waitEvent,
  delay,
  SocketHarness,
} from '../helpers/socket.js';
import jwt from 'jsonwebtoken';
import { normalUserToken } from '../helpers/tokens.js';

const tokenForEmail = (email: string) =>
  jwt.sign({ email, role: 'coordinador', permissions: {} }, process.env.JWT_SECRET as string, {
    expiresIn: '24h',
  });

// §0.6 item 15: pin every current fan-out rule of SocketManager.
describe('socket fan-out (characterization)', () => {
  let harness: SocketHarness;

  beforeAll(async () => {
    harness = await startSocketServer();
  });

  afterAll(async () => {
    await harness.close();
  });

  async function authed(email?: string): Promise<Socket> {
    const s = connectClient(harness.url);
    await waitConnect(s);
    s.emit('client_connected', { token: email ? tokenForEmail(email) : normalUserToken() });
    await delay(150); // let the server store the decoded auth payload
    return s;
  }

  async function unauthed(): Promise<Socket> {
    const s = connectClient(harness.url);
    await waitConnect(s);
    await delay(100);
    return s;
  }

  const updateDataPayload = {
    // The `user`-shaped object the real client emits (mirror roles/page.tsx).
    name: 'Admin',
    email: 'admin@buni.test',
    roles: [{ id: 'r1' }],
    users: [{ id: 'u1' }],
    events: [{ id: 'e1' }],
    forms: [{ id: 'f1' }],
    scenery: [{ id: 's1' }],
    programs: [{ id: 'p1' }],
  };

  it('(a) UPDATE_EVENT_FORMS: authed A -> authed B only (recipient-gated, not back to A)', async () => {
    const a = await authed();
    const b = await authed();
    try {
      const onB = waitEvent(b, 'UPDATE_EVENT_FORMS');
      const onA = waitEvent(a, 'UPDATE_EVENT_FORMS');
      const payload = { idEvent: 'e1', typeForm: 'inscriptions', data: { nombre: 'X' } };
      a.emit('UPDATE_EVENT_FORMS', payload);
      const [gotB, gotA] = await Promise.all([onB, onA]);
      expect(gotB).toEqual(payload);
      expect(gotA).toBeNull(); // not echoed to the emitter
    } finally {
      a.close();
      b.close();
    }
  });

  it('(a2) UPDATE_EVENT_FORMS: unauthenticated recipient does NOT receive', async () => {
    const a = await authed();
    const u = await unauthed();
    try {
      const onU = waitEvent(u, 'UPDATE_EVENT_FORMS');
      a.emit('UPDATE_EVENT_FORMS', { idEvent: 'e1', typeForm: 'assists', data: {} });
      expect(await onU).toBeNull();
    } finally {
      a.close();
      u.close();
    }
  });

  it('(b) UPDATE_DATA full/subset split (recipient-gated) from authed emitter', async () => {
    const emitter = await authed();
    const authedRecipient = await authed();
    const unauthedRecipient = await unauthed();
    try {
      const onAuthed = waitEvent<Record<string, unknown>>(authedRecipient, 'UPDATE_DATA');
      const onUnauthed = waitEvent<Record<string, unknown>>(unauthedRecipient, 'UPDATE_DATA');
      emitter.emit('UPDATE_DATA', updateDataPayload);
      const full = await onAuthed;
      const subset = await onUnauthed;
      // Authenticated recipient gets the full payload.
      expect(full).toEqual(updateDataPayload);
      // Unauthenticated recipient gets only the {events,forms,scenery,programs} subset.
      expect(subset).toEqual({
        events: updateDataPayload.events,
        forms: updateDataPayload.forms,
        scenery: updateDataPayload.scenery,
        programs: updateDataPayload.programs,
      });
    } finally {
      emitter.close();
      authedRecipient.close();
      unauthedRecipient.close();
    }
  });

  it('(c) UPDATE_DATA from UNAUTHENTICATED emitter still fans out (ungated emission)', async () => {
    const emitter = await unauthed();
    const authedRecipient = await authed();
    const unauthedRecipient = await unauthed();
    try {
      const onAuthed = waitEvent<Record<string, unknown>>(authedRecipient, 'UPDATE_DATA');
      const onUnauthed = waitEvent<Record<string, unknown>>(unauthedRecipient, 'UPDATE_DATA');
      emitter.emit('UPDATE_DATA', updateDataPayload);
      expect(await onAuthed).toEqual(updateDataPayload);
      expect(await onUnauthed).toEqual({
        events: updateDataPayload.events,
        forms: updateDataPayload.forms,
        scenery: updateDataPayload.scenery,
        programs: updateDataPayload.programs,
      });
    } finally {
      emitter.close();
      authedRecipient.close();
      unauthedRecipient.close();
    }
  });

  it('(d) UPDATE_USER SELF round-trip (emitter own email)', async () => {
    const a = await authed();
    try {
      const onA = waitEvent<Record<string, unknown>>(a, 'UPDATE_USER');
      a.emit('UPDATE_USER', { email: 'normal@buni.test', extra: 'self' });
      const got = await onA;
      expect(got).not.toBeNull();
      expect(got!.email).toBe('normal@buni.test');
      expect(got!.extra).toBe('self');
    } finally {
      a.close();
    }
  });

  it('(e) UPDATE_USER CROSS-EMAIL relay (admin role-edit flow): A(adminX) emits for B email -> B receives', async () => {
    const a = await authed('admin-emitter@buni.test'); // emitter stored email X
    const b = await authed('target-user@buni.test'); // target stored email Y (different)
    try {
      const onB = waitEvent<Record<string, unknown>>(b, 'UPDATE_USER');
      const onA = waitEvent<Record<string, unknown>>(a, 'UPDATE_USER');
      // A emits UPDATE_USER for B's email — a DIFFERENT email than A's own.
      a.emit('UPDATE_USER', { email: 'target-user@buni.test', role: 'nuevo-rol' });
      const [gotB, gotA] = await Promise.all([onB, onA]);
      // B (whose stored data.email matches the payload) receives the merged payload...
      expect(gotB).not.toBeNull();
      expect(gotB!.email).toBe('target-user@buni.test');
      expect(gotB!.role).toBe('nuevo-rol');
      // ...and A (whose email does NOT match) does not. Relay is driven purely by data.email matching.
      expect(gotA).toBeNull();
    } finally {
      a.close();
      b.close();
    }
  });
});
