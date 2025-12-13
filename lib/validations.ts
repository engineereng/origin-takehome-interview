import { z } from 'zod';

export const sessionStatusSchema = z.enum([
  'Scheduled',
  'Completed',
  'Canceled',
  'No Show',
]);

export const createSessionSchema = z.object({
  therapist_id: z.number().int().positive(),
  patient_id: z.number().int().positive(),
  date: z.string().datetime(),
  status: sessionStatusSchema.optional().default('Scheduled'),
});

export const updateSessionSchema = z.object({
  therapist_id: z.number().int().positive().optional(),
  patient_id: z.number().int().positive().optional(),
  date: z.string().datetime().optional(),
  status: sessionStatusSchema.optional(),
});

export const sessionQuerySchema = z.object({
  status: sessionStatusSchema.optional(),
  therapist_id: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : undefined)),
  therapist_name: z.string().optional(),
  page: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : 10)),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionQueryParams = z.infer<typeof sessionQuerySchema>;

