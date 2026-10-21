import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Socket } from 'socket.io-client';
import { io as ioClient } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import {
  startSocketServer,
  connectClient,
  waitConnect,
  waitEvent,
  delay,
  SocketHarness,
} from '../helpers/socket.js';

const tokenForEmail = (email: string) =>
  jwt.sign({ email, role: 'coordinador', permissions: {} }, process.env.JWT_SECRET as string, {
    expiresIn: '24h',
  });

describe('Phase 6: socket validation + auth', () => {
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
    s.emit('client_connected', { token: email ? tokenForEmail(email) : tokenForEmail('a@buni.test') });
    await delay(150);
    return s;
  }

  async function unauthed(): Promise<Socket> {
    const s = connectClient(harness.url);
    await waitConnect(s);
    await delay(100);
    return s;
  }

  it('malformed UPDATE_USER (no email) is dropped — no relay', async () => {
    const a = await authed('a@buni.test');
    const target = await authed('t@buni.test');
    try {
      const onTarget = waitEvent(target, 'UPDATE_USER');
      // malformed: missing required `email`.
      (a as unknown as { emit: (e: string, p: unknown) => void }).emit('UPDATE_USER', {
        role: 'x',
      });
      expect(await onTarget).toBeNull();
    } finally {
      a.close();
      target.close();
    }
  });

  it('UPDATE_USER from an UNAUTHENTICATED emitter is dropped', async () => {
    const emitter = await unauthed();
    const target = await authed('victim@buni.test');
    try {
      const onTarget = waitEvent(target, 'UPDATE_USER');
      emitter.emit('UPDATE_USER', { email: 'victim@buni.test', role: 'hacked' } as never);
      expect(await onTarget).toBeNull();
    } finally {
      emitter.close();
      target.close();
    }
  });

  it('UPDATE_USER cross-email from an AUTHENTICATED emitter still reaches the target', async () => {
    const emitter = await authed('admin@buni.test');
    const target = await authed('victim@buni.test');
    try {
      const onTarget = waitEvent<Record<string, unknown>>(target, 'UPDATE_USER');
      emitter.emit('UPDATE_USER', { email: 'victim@buni.test', role: 'nuevo' } as never);
      const got = await onTarget;
      expect(got).not.toBeNull();
      expect(got!.role).toBe('nuevo');
    } finally {
      emitter.close();
      target.close();
    }
  });

  it('malformed UPDATE_EVENT_FORMS (missing idEvent) is dropped', async () => {
    const a = await authed('a@buni.test');
    const b = await authed('b@buni.test');
    try {
      const onB = waitEvent(b, 'UPDATE_EVENT_FORMS');
      (a as unknown as { emit: (e: string, p: unknown) => void }).emit('UPDATE_EVENT_FORMS', {
        typeForm: 'inscriptions',
      });
      expect(await onB).toBeNull();
    } finally {
      a.close();
      b.close();
    }
  });

  it('handshake auth via token_hs cookie authenticates the socket (receives full UPDATE_DATA)', async () => {
    // Connect a recipient authenticated ONLY via the token_hs handshake cookie (no client_connected).
    const token = tokenForEmail('cookie@buni.test');
    const cookieRecipient = ioClient(harness.url, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
      extraHeaders: { Cookie: `token_hs=${token}` },
    });
    await waitConnect(cookieRecipient);
    await delay(150);

    const emitter = await authed('emitter@buni.test');
    try {
      const onRecipient = waitEvent<Record<string, unknown>>(cookieRecipient, 'UPDATE_DATA');
      emitter.emit('UPDATE_DATA', {
        email: 'emitter@buni.test',
        events: [{ id: 'e1' }],
        forms: [],
        scenery: [],
        programs: [],
      } as never);
      const got = await onRecipient;
      // A cookie-authenticated recipient gets the FULL payload (incl. the email field), not the subset.
      expect(got).not.toBeNull();
      expect(got!.email).toBe('emitter@buni.test');
    } finally {
      emitter.close();
      cookieRecipient.close();
    }
  });

  it('handshake auth via body token authenticates the socket (receives full UPDATE_DATA)', async () => {
    const recipient = await authed('body@buni.test'); // authenticated via client_connected body token
    const emitter = await authed('emitter2@buni.test');
    try {
      const onRecipient = waitEvent<Record<string, unknown>>(recipient, 'UPDATE_DATA');
      emitter.emit('UPDATE_DATA', {
        email: 'emitter2@buni.test',
        events: [{ id: 'e2' }],
        forms: [],
        scenery: [],
        programs: [],
      } as never);
      const got = await onRecipient;
      expect(got).not.toBeNull();
      expect(got!.email).toBe('emitter2@buni.test');
    } finally {
      emitter.close();
      recipient.close();
    }
  });
});
