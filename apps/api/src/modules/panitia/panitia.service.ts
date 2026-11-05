import { db } from '../../config/database';
import type { CreatePanitiaInput } from './panitia.validation';

const include = { user: { select: { id: true, nama: true, email: true } } };

export const listByKegiatan = (kegiatanId: number) =>
  db.panitia.findMany({ where: { kegiatanId }, include, orderBy: { id: 'asc' } });

export const create = (input: CreatePanitiaInput) => db.panitia.create({ data: input, include });

export const update = (id: number, jabatan: string) => db.panitia.update({ where: { id }, data: { jabatan }, include });

export const remove = async (id: number) => {
  await db.panitia.delete({ where: { id } });
};
