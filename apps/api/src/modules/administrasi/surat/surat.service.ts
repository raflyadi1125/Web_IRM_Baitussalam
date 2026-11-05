import { db } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import { buildMeta, getPagination } from '../../../shared/utils/pagination';

export interface SuratInput {
  nomor: string;
  jenis: 'MASUK' | 'KELUAR';
  perihal: string;
  pengirim?: string;
  tujuan?: string;
  tanggal: Date;
  isi?: string;
  fileUrl?: string;
}

export const list = async (query: { jenis?: 'MASUK' | 'KELUAR'; page?: number; limit?: number }) => {
  const { page, limit, skip } = getPagination(query);
  const where = query.jenis ? { jenis: query.jenis } : {};
  const [items, total] = await db.$transaction([
    db.surat.findMany({ where, skip, take: limit, orderBy: { tanggal: 'desc' } }),
    db.surat.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const getById = async (id: number) => {
  const item = await db.surat.findUnique({ where: { id } });
  if (!item) throw new AppError('Surat tidak ditemukan', 404);
  return item;
};

export const create = (input: SuratInput, userId: number) => db.surat.create({ data: { ...input, createdById: userId } });
export const update = (id: number, input: Partial<SuratInput>) => db.surat.update({ where: { id }, data: input });
export const remove = async (id: number) => {
  await db.surat.delete({ where: { id } });
};
