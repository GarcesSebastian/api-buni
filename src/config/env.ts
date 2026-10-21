import { z } from 'zod';
import 'dotenv/config';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // R4: default PORT to 4000 so an unset PORT does not collide with the Next app on 3000.
  PORT: z.coerce.number().int().positive().default(4000),

  DB_HOST: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(''), // MySQL allows empty passwords; do not force non-empty
  DB_NAME: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306), // was passed as string to the pool

  CORS_ORIGINS: z.string().min(1), // comma-separated; split at use sites
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 chars')
    .refine((v) => v !== 'your_secret_key', 'JWT_SECRET must not be the default'),

  ADMIN_NAME: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_ROLE: z.string().min(1).default('admin'),

  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().positive().default(15),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),

  FRONTEND_URL: z.string().url(),
  // Topology hint used to choose the cookie SameSite in Phase 3 (see design §3.8). Defaults to the
  // verified cross-origin reality; set 'same-site' only when app + API share a registrable domain.
  APP_API_TOPOLOGY: z.enum(['cross-site', 'same-site']).default('cross-site'),

  // Phase 2 validation enforcement toggle; parse-and-log by default.
  ZOD_ENFORCE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment configuration:\n', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
})();
