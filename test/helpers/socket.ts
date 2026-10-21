// Boots a real http + socket.io server driving the current SocketManager, and provides
// socket.io-client helpers for the characterization of the fan-out rules (§0.6 item 15).
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { Server } from 'socket.io';
import { io as ioClient, Socket } from 'socket.io-client';
import { SocketManager } from '../../src/lib/SocketManager.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../src/contracts/socket.js';

export interface SocketHarness {
  url: string;
  close: () => Promise<void>;
}

/**
 * The SocketManager is a singleton keyed on the first io passed to getInstance. To get a clean server
 * per test file we reset the static singleton before wiring a fresh io onto a fresh http server.
 */
export async function startSocketServer(): Promise<SocketHarness> {
  // Reset the singleton so each harness gets its own io/users map.
  (SocketManager as unknown as { instance: unknown }).instance = undefined;
  (SocketManager as unknown as { users: Map<string, unknown> }).users = new Map();

  const server = http.createServer();
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: { origin: '*' },
  });
  const mgr = SocketManager.getInstance(io);
  mgr.start();

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve) => {
        io.close();
        server.close(() => resolve());
      }),
  };
}

export function connectClient(url: string): Socket {
  return ioClient(url, { transports: ['websocket'], forceNew: true, reconnection: false });
}

export function waitConnect(socket: Socket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve());
    socket.on('connect_error', reject);
  });
}

/** Resolves with the first payload of `event`, or null if `timeoutMs` elapses with no emission. */
export function waitEvent<T = unknown>(socket: Socket, event: string, timeoutMs = 600): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      resolve(null);
    }, timeoutMs);
    const handler = (payload: T) => {
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(payload);
    };
    socket.on(event, handler);
  });
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
