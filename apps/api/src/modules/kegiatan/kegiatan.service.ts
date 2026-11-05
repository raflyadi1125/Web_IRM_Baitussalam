import { db } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import { buildMeta } from '../../shared/utils/pagination';
import { logAudit } from '../audit/audit.service';
import type { CreateKegiatanInput, ListKegiatanQuery, UpdateKegiatanInput } from './kegiatan.validation';

export const list = async ({ status, periodeId, search, page, limit }: ListKegiatanQuery) => {
  const where = {
    ...(status ? { status } : {}),
    ...(periodeId ? { periodeId } : {}),
    ...(search ? { nama: { contains: search, mode: 'insensitive' as const } } : {}),
  };
  const [items, total] = await db.$transaction([
    db.kegiatan.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { tanggalMulai: 'desc' } }),
    db.kegiatan.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const getById = async (id: number) => {
  const item = await db.kegiatan.findUnique({
    where: { id },
    include: {
      periode: { select: { id: true, nama: true } },
      panitia: { include: { user: { select: { id: true, nama: true } } } },
    },
  });
  if (!item) throw new AppError('Kegiatan tidak ditemukan', 404);
  return item;
};

export const create = async (input: CreateKegiatanInput, actorId: number) => {
  const item = await db.kegiatan.create({ data: input });
  await logAudit(actorId, 'CREATE', 'Kegiatan', item.id, { nama: item.nama });
  return item;
};

export const update = async (id: number, input: UpdateKegiatanInput, actorId: number) => {
  const item = await db.kegiatan.update({ where: { id }, data: input });
  await logAudit(actorId, 'UPDATE', 'Kegiatan', id, { fields: Object.keys(input) });
  return item;
};

export const remove = async (id: number, actorId: number) => {
  await db.kegiatan.delete({ where: { id } });
  await logAudit(actorId, 'DELETE', 'Kegiatan', id);
};
