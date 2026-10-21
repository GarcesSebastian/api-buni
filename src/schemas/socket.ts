import { z } from 'zod';

// Inbound socket payload schemas. .passthrough() where the current code forwards arbitrary fields.
// Malformed payloads are DROPPED (approved change v); well-formed payloads behave identically.

export const ClientConnectedSchema = z.object({ token: z.string().optional() }).passthrough();

// UPDATE_DATA carries the user-shaped object; arbitrary fields pass through, subset is extracted.
export const UpdateDataSchema = z.object({}).passthrough();

// UPDATE_USER must carry an email; extra fields pass through.
export const UpdateUserSchema = z.object({ email: z.string() }).passthrough();

// UPDATE_EVENT_FORMS: data passes through (arbitrary public form fields).
export const UpdateEventFormsSchema = z
  .object({
    idEvent: z.string(),
    typeForm: z.string(),
    data: z.record(z.string(), z.unknown()),
  })
  .passthrough();
