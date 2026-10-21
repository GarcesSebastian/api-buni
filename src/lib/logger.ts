import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV !== 'production';

// Redact secrets everywhere they may appear in logged objects.
const redact = {
  paths: [
    'req.headers.authorization',
    'req.body.password',
    'req.body.token',
    'password',
    'token',
    '*.password',
    '*.token',
  ],
  censor: '[REDACTED]',
};

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : isDev ? 'debug' : 'info',
  redact,
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
});

export const httpLogger = pinoHttp({
  logger,
  redact,
});
