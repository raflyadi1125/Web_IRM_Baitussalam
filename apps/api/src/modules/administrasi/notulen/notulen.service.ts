import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';

export interface NotulenInput {
  kegiatanId?: number;
  judul: string;
  isi: string;
  tanggal: Date;
}

const include = { createdBy: { select: { id: true, nama: true } }, kegiatan: { select: { id: true, nama: true } } };

export const list = (kegiatanId?: number) =>
  prisma.notulen.findMany({ where: kegiatanId ? { kegiatanId } : {}, include, orderBy: { tanggal: 'desc' } });

export const getById = async (id: number) => {
  const item = await prisma.notulen.findUnique({ where: { id }, include });
  if (!item) throw new AppError('Notulen tidak ditemukan', 404);
  return item;
};

export const create = (input: NotulenInput, userId: number) =>
  prisma.notulen.create({ data: { ...input, createdById: userId }, include });

export const update = (id: number, input: Partial<NotulenInput>) => prisma.notulen.update({ where: { id }, data: input, include });

export const remove = async (id: number) => {
  await prisma.notulen.delete({ where: { id } });
};
