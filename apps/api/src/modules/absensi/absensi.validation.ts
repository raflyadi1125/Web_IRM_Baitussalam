import { z } from 'zod';

export const STATUS_ABSENSI = ['HADIR', 'IZIN', 'SAKIT', 'ALPA'] as const;

export const manualAbsensiSchema = z.object({
  kegiatanId: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
  status: z.enum(STATUS_ABSENSI).default('HADIR'),
  keterangan: z.string().optional(),
});
export const scanAbsensiSchema = z.object({ token: z.string().min(10) });
export const listAbsensiQuery = z.object({ kegiatanId: z.coerce.number().int().positive() });
export const kegiatanIdParam = z.object({ kegiatanId: z.coerce.number().int().positive() });

export type ManualAbsensiInput = z.infer<typeof manualAbsensiSchema>;
