import { z } from 'zod';

const tipe = z.enum(['PEMASUKAN', 'PENGELUARAN']);

export const createTransaksiSchema = z.object({
  kategoriId: z.coerce.number().int().positive(),
  kegiatanId: z.coerce.number().int().positive().optional(),
  tipe,
  jumlah: z.coerce.number().positive(),
  tanggal: z.coerce.date(),
  keterangan: z.string().optional(),
});
export const updateTransaksiSchema = createTransaksiSchema.partial();

export const listTransaksiQuery = z.object({
  tipe: tipe.optional(),
  kategoriId: z.coerce.number().int().positive().optional(),
  kegiatanId: z.coerce.number().int().positive().optional(),
  dari: z.coerce.date().optional(),
  sampai: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTransaksiInput = z.infer<typeof createTransaksiSchema>;
export type UpdateTransaksiInput = z.infer<typeof updateTransaksiSchema>;
export type ListTransaksiQuery = z.infer<typeof listTransaksiQuery>;
