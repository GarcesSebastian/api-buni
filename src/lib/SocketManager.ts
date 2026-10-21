import jwt from 'jsonwebtoken';
import type { Server, Socket } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import {
  ClientConnectedSchema,
  UpdateDataSchema,
  UpdateUserSchema,
  UpdateEventFormsSchema,
} from '../schemas/socket.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../contracts/socket.js';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

interface SocketUser {
  socket: TypedSocket;
  data: Record<string, unknown> & { token?: string; email?: string };
  authenticated: boolean;
}

/** Minimal cookie-header parser for the handshake (reads token_hs). */
function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return undefined;
}

export class SocketManager {
  static instance: SocketManager | undefined;
  static io: Server<ClientToServerEvents, ServerToClientEvents>;
  static users = new Map<string, SocketUser>();
  constructor() {}

  static getInstance(io: Server<ClientToServerEvents, ServerToClientEvents>): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
      SocketManager.io = io;
    }
    return SocketManager.instance;
  }

  start(): void {
    logger.info('Iniciando SocketManager');

    // Handshake auth: resolve the token token_hs-cookie -> (later) body token. jwt.verify in
    // try/catch; failure marks authenticated:false (no crash). Unauthenticated sockets still connect.
    SocketManager.io.use((socket, next) => {
      const cookieToken = parseCookie(socket.handshake.headers.cookie, 'token_hs');
      if (cookieToken) {
        try {
          const decoded = jwt.verify(cookieToken, env.JWT_SECRET) as Record<string, unknown>;
          (socket.data as Record<string, unknown>).handshakeAuth = {
            token: cookieToken,
            ...decoded,
          };
        } catch {
          // invalid handshake cookie -> remain unauthenticated; the body token is the fallback.
        }
      }
      next();
    });

    SocketManager.io.on('connection', (socket: TypedSocket) => {
      // Seed from handshake auth if present.
      const handshakeAuth = (socket.data as Record<string, unknown>).handshakeAuth as
        | (Record<string, unknown> & { token?: string; email?: string })
        | undefined;

      if (!SocketManager.users.has(socket.id)) {
        SocketManager.users.set(socket.id, {
          socket,
          data: handshakeAuth ?? {},
          authenticated: Boolean(handshakeAuth?.token),
        });
      }

      socket.on('client_connected', (payload) => {
        const parsed = ClientConnectedSchema.safeParse(payload);
        if (!parsed.success) {
          logger.warn('socket client_connected: malformed payload dropped');
          return;
        }
        const token = parsed.data.token;
        if (!token) return;
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET) as Record<string, unknown>;
          const entry = SocketManager.users.get(socket.id);
          if (entry) {
            entry.data = { token, ...decoded };
            entry.authenticated = true;
          }
        } catch {
          // invalid body token -> stay unauthenticated (no crash — the Phase-6 fix).
          logger.warn('socket client_connected: invalid token');
        }
      });

      socket.on('UPDATE_DATA', (payload) => {
        const parsed = UpdateDataSchema.safeParse(payload);
        if (!parsed.success) {
          logger.warn('socket UPDATE_DATA: malformed payload dropped');
          return;
        }
        const data = parsed.data as Record<string, unknown>;
        // Emission stays UNGATED; relay is recipient-gated full/subset (preserved §0.2).
        SocketManager.users.forEach((user) => {
          if (socket.id !== user.socket.id) {
            if (user.data.token) {
              user.socket.emit('UPDATE_DATA', data);
              return;
            }
            const { events, forms, scenery, programs } = data;
            user.socket.emit('UPDATE_DATA', { events, forms, scenery, programs });
          }
        });
      });

      socket.on('UPDATE_USER', (payload) => {
        const parsed = UpdateUserSchema.safeParse(payload);
        if (!parsed.success) {
          logger.warn('socket UPDATE_USER: malformed payload dropped');
          return;
        }
        // Approved change (vi): require an AUTHENTICATED emitter (reject unauthenticated), but STILL
        // relay cross-email to the socket whose stored data.email matches (preserved — the admin
        // role-edit broadcast).
        const emitter = SocketManager.users.get(socket.id);
        if (!emitter?.authenticated) {
          logger.warn('socket UPDATE_USER: unauthenticated emitter dropped');
          return;
        }
        const data = parsed.data;
        SocketManager.users.forEach((user) => {
          if (user.data.email === data.email) {
            user.data = {
              ...user.data,
              ...data,
            };
            user.socket.emit('UPDATE_USER', user.data as { email: string } & Record<string, unknown>);
          }
        });
      });

      socket.on('UPDATE_EVENT_FORMS', (payload) => {
        const parsed = UpdateEventFormsSchema.safeParse(payload);
        if (!parsed.success) {
          logger.warn('socket UPDATE_EVENT_FORMS: malformed payload dropped');
          return;
        }
        const data = parsed.data;
        // Recipient-gated to authenticated sockets (preserved §0.2).
        SocketManager.users.forEach((user) => {
          if (socket.id !== user.socket.id && user.data.token) {
            user.socket.emit(
              'UPDATE_EVENT_FORMS',
              data as unknown as Parameters<ServerToClientEvents['UPDATE_EVENT_FORMS']>[0],
            );
          }
        });
      });

      socket.on('disconnect', () => {
        SocketManager.users.delete(socket.id);
      });
    });
  }
}
