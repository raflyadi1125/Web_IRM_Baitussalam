import { z } from 'zod';

export const createPengurusSchema = z.object({
  userId: z.coerce.number().int().positive(),
  periodeId: z.coerce.number().int().positive(),
  jabatan: z.string().trim().min(2),
  divisi: z.string().trim().optional(),
});
export const updatePengurusSchema = createPengurusSchema.omit({ userId: true, periodeId: true }).partial();
export const listPengurusQuery = z.object({ periodeId: z.coerce.number().int().positive().optional() });

export type CreatePengurusInput = z.infer<typeof createPengurusSchema>;
export type UpdatePengurusInput = z.infer<typeof updatePengurusSchema>;
