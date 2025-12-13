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
  therapist_id: z
    .string()
    .optional()
    .transform((val: string | undefined) => {
      if (!val) return undefined;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    })
    .refine((val) => val === undefined || (typeof val === 'number' && val > 0), {
      message: 'therapist_id must be a positive integer',
    }),
  therapist_name: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional().default('ASC'),
  page: z
    .string()
    .optional()
    .transform((val: string | undefined) => {
      if (!val) return 1;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 1 : parsed;
    })
    .refine((val) => typeof val === 'number' && val > 0, {
      message: 'page must be a positive integer',
    }),
  limit: z
    .string()
    .optional()
    .transform((val: string | undefined) => {
      if (!val) return 10;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 10 : parsed;
    })
    .refine((val) => typeof val === 'number' && val > 0 && val <= 100, {
      message: 'limit must be between 1 and 100',
    }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionQueryParams = z.infer<typeof sessionQuerySchema>;

