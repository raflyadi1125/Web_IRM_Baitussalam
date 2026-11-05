import { db } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import { buildMeta, getPagination } from '../../../shared/utils/pagination';

export interface PengumumanInput {
  judul: string;
  isi: string;
}

const include = { createdBy: { select: { id: true, nama: true } } };

export const list = async (query: unknown) => {
  const { page, limit, skip } = getPagination(query);
  const [items, total] = await db.$transaction([
    db.pengumuman.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include }),
    db.pengumuman.count(),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const getById = async (id: number) => {
  const item = await db.pengumuman.findUnique({ where: { id }, include });
  if (!item) throw new AppError('Pengumuman tidak ditemukan', 404);
  return item;
};

export const create = (input: PengumumanInput, userId: number) =>
  db.pengumuman.create({ data: { ...input, createdById: userId }, include });
export const update = (id: number, input: Partial<PengumumanInput>) => db.pengumuman.update({ where: { id }, data: input, include });
export const remove = async (id: number) => {
  await db.pengumuman.delete({ where: { id } });
};
