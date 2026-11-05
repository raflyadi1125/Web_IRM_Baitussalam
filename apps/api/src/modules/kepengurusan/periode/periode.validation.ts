import { z } from 'zod';

export const createPeriodeSchema = z.object({
  nama: z.string().trim().min(3), // contoh: "2026/2027"
  mulai: z.coerce.date(),
  selesai: z.coerce.date(),
  aktif: z.boolean().default(false),
});
export const updatePeriodeSchema = createPeriodeSchema.partial();

export type CreatePeriodeInput = z.infer<typeof createPeriodeSchema>;
export type UpdatePeriodeInput = z.infer<typeof updatePeriodeSchema>;