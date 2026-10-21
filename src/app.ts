import './config/env.js';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import responseTime from 'response-time';
import userRoutes from './routes/user.routes.js';
import eventsRoutes from './routes/events.routes.js';
import filesRoutes from './routes/files.routes.js';
import authRoutes from './routes/auth.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import sceneryRoutes from './routes/scenery.routes.js';
import programsRoutes from './routes/programs.routes.js';
import formsRoutes from './routes/forms.routes.js';
import experimentalRoutes from './routes/experimental.routes.js';
import emailRoutes from './routes/email.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { httpLogger } from './lib/logger.js';
import { env } from './config/env.js';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(responseTime());
app.use(httpLogger);

const allowedOrigins = env.CORS_ORIGINS.split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

// Global rate limiter — coerced env (design §3.5). 429 body shape preserved verbatim.
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  message: { message: 'Muchas peticiones, por favor intente mas tarde.' },
});
app.use(limiter);

// Dedicated strict limiter for login — same verbatim 429 body, skip successful requests.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { message: 'Muchas peticiones, por favor intente mas tarde.' },
});
app.use('/auth/login', loginLimiter);

app.use('/users', userRoutes);
app.use('/events', eventsRoutes);
app.use('/files', filesRoutes);
app.use('/auth', authRoutes);
app.use('/roles', rolesRoutes);
app.use('/scenery', sceneryRoutes);
app.use('/programs', programsRoutes);
app.use('/forms', formsRoutes);
// /experimental is dev-only — mounted only outside production (design §3.2).
if (env.NODE_ENV !== 'production') {
  app.use('/experimental', experimentalRoutes);
}
app.use('/email', emailRoutes);

app.get('/', (req, res) => {
  res.json({
    buni: 'Estamos conectados uwu',
  });
});

// Central error handler — registered LAST.
app.use(errorHandler);

export { app };
