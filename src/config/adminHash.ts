import bcrypt from 'bcryptjs';
import { env } from './env.js';

// Bootstrap: hash ADMIN_PASSWORD once into an in-memory hash so both admin-compare paths (Login and
// CreateSession) use a constant-time bcrypt.compare instead of a plaintext ===. Promoting the admin to
// a real DB user is out of scope (design §3.6).
export const adminHash: string = bcrypt.hashSync(env.ADMIN_PASSWORD, 10);
