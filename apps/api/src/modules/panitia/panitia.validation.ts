import { z } from 'zod';

export const createPanitiaSchema = z.object({
  kegiatanId: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
  peran: z.string().trim().min(2),
});
export const updatePanitiaSchema = z.object({ peran: z.string().trim().min(2) });
export const listPanitiaQuery = z.object({ kegiatanId: z.coerce.number().int().positive() });

export type CreatePanitiaInput = z.infer<typeof createPanitiaSchema>;