import { db } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import type { CreatePanitiaInput } from './panitia.validation';

const detailed = () =>
  db.orm.public.PanitiaKegiatan.include('user', (u) => u.select('id', 'nama', 'email'));

export const listByKegiatan = (kegiatanId: number) =>
  detailed().where({ kegiatanId }).orderBy((p) => p.id.asc()).all();

export const create = async (input: CreatePanitiaInput) => {
  const exists = await db.orm.public.PanitiaKegiatan
    .where({ kegiatanId: input.kegiatanId, userId: input.userId })
    .first();
  if (exists) throw new AppError('Anggota sudah terdaftar sebagai panitia kegiatan ini', 409);

  const item = await db.orm.public.PanitiaKegiatan.create(input);
  return detailed().where({ id: item.id }).first();
};

export const update = async (id: number, peran: string) => {
  const item = await db.orm.public.PanitiaKegiatan.where({ id }).update({ peran });
  if (!item) throw new AppError('Panitia tidak ditemukan', 404);
  return detailed().where({ id }).first();
};

export const remove = async (id: number) => {
  const item = await db.orm.public.PanitiaKegiatan.where({ id }).delete();
  if (!item) throw new AppError('Panitia tidak ditemukan', 404);
};