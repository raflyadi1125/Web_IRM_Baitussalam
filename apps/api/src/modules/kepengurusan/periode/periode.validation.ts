import { z } from 'zod';

export const createPeriodeSchema = z.object({
  nama: z.string().trim().min(3),
  tahunMulai: z.coerce.number().int().min(2000),
  tahunSelesai: z.coerce.number().int().min(2000),
  aktif: z.boolean().default(false),
});
export const updatePeriodeSchema = createPeriodeSchema.partial();

export type CreatePeriodeInput = z.infer<typeof createPeriodeSchema>;
export type UpdatePeriodeInput = z.infer<typeof updatePeriodeSchema>;
