import { z } from 'zod';
import { KATEGORI_KEGIATAN, STATUS_KEGIATAN } from './kegiatan.type';

export const createKegiatanSchema = z.object({
  periodeId: z.coerce.number().int().positive().optional(),
  judul: z.string().trim().min(3),
  deskripsi: z.string().optional(),
  kategori: z.enum(KATEGORI_KEGIATAN).default('LAINNYA'),
  lokasi: z.string().optional(),
  tanggalMulai: z.coerce.date(),
  tanggalSelesai: z.coerce.date().optional(),
  posterUrl: z.string().trim().optional(),
  status: z.enum(STATUS_KEGIATAN).default('DRAFT'),
});
export const updateKegiatanSchema = createKegiatanSchema.partial();

export const listKegiatanQuery = z.object({
  status: z.enum(STATUS_KEGIATAN).optional(),
  periodeId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateKegiatanInput = z.infer<typeof createKegiatanSchema>;
export type UpdateKegiatanInput = z.infer<typeof updateKegiatanSchema>;
export type ListKegiatanQuery = z.infer<typeof listKegiatanQuery>;