import { prisma } from '../../../config/database';
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
  const [items, total] = await prisma.$transaction([
    prisma.surat.findMany({ where, skip, take: limit, orderBy: { tanggal: 'desc' } }),
    prisma.surat.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const getById = async (id: number) => {
  const item = await prisma.surat.findUnique({ where: { id } });
  if (!item) throw new AppError('Surat tidak ditemukan', 404);
  return item;
};

export const create = (input: SuratInput, userId: number) => prisma.surat.create({ data: { ...input, createdById: userId } });
export const update = (id: number, input: Partial<SuratInput>) => prisma.surat.update({ where: { id }, data: input });
export const remove = async (id: number) => {
  await prisma.surat.delete({ where: { id } });
};
