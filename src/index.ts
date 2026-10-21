import './config/env.js';
import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { SocketManager } from './lib/SocketManager.js';
import { assertDbReady } from './database/config.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import type { ClientToServerEvents, ServerToClientEvents } from './contracts/socket.js';

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  },
});

try {
  const socketManager = SocketManager.getInstance(io);
  socketManager.start();
} catch (error) {
  logger.error({ err: error }, 'Error al inicializar el socket manager');
}

const PORT = env.PORT;

assertDbReady()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error({ err: error }, 'No se pudo conectar a la base de datos');
    process.exit(1);
  });

export { server, io };
