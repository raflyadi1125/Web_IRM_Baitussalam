import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import { buildMeta, getPagination } from '../../../shared/utils/pagination';

export interface PengumumanInput {
  judul: string;
  isi: string;
}

const include = { createdBy: { select: { id: true, nama: true } } };

export const list = async (query: unknown) => {
  const { page, limit, skip } = getPagination(query);
  const [items, total] = await prisma.$transaction([
    prisma.pengumuman.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include }),
    prisma.pengumuman.count(),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const getById = async (id: number) => {
  const item = await prisma.pengumuman.findUnique({ where: { id }, include });
  if (!item) throw new AppError('Pengumuman tidak ditemukan', 404);
  return item;
};

export const create = (input: PengumumanInput, userId: number) =>
  prisma.pengumuman.create({ data: { ...input, createdById: userId }, include });
export const update = (id: number, input: Partial<PengumumanInput>) => prisma.pengumuman.update({ where: { id }, data: input, include });
export const remove = async (id: number) => {
  await prisma.pengumuman.delete({ where: { id } });
};
