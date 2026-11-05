import { all, db } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import type { CreatePengurusInput, UpdatePengurusInput } from './pengurus.validation';

const detailed = () =>
  db.orm.public.Pengurus
    .include('user', (u) => u.select('id', 'nama', 'email'))
    .include('periode', (p) => p.select('id', 'nama'));

export const list = (periodeId?: number) =>
  detailed()
    .where((p) => (periodeId ? p.periodeId.eq(periodeId) : all()))
    .orderBy((p) => p.id.asc())
    .all();

export const getById = async (id: number) => {
  const item = await detailed().where({ id }).first();
  if (!item) throw new AppError('Pengurus tidak ditemukan', 404);
  return item;
};

export const create = async (input: CreatePengurusInput) => {
  const [user, periode, exists] = await Promise.all([
    db.orm.public.User.where({ id: input.userId }).first(),
    db.orm.public.PeriodeKepengurusan.where({ id: input.periodeId }).first(),
    db.orm.public.Pengurus.where({ userId: input.userId, periodeId: input.periodeId }).first(),
  ]);
  if (!user) throw new AppError('User tidak ditemukan', 404);
  if (!periode) throw new AppError('Periode tidak ditemukan', 404);
  if (exists) throw new AppError('User sudah menjadi pengurus pada periode ini', 409);

  const item = await db.orm.public.Pengurus.create({
    userId: input.userId,
    periodeId: input.periodeId,
    jabatan: input.jabatan,
    divisi: input.divisi ?? null,
  });
  return getById(item.id);
};

export const update = async (id: number, input: UpdatePengurusInput) => {
  if (Object.keys(input).length === 0) throw new AppError('Tidak ada data yang diubah', 400);
  const item = await db.orm.public.Pengurus.where({ id }).update(input);
  if (!item) throw new AppError('Pengurus tidak ditemukan', 404);
  return getById(id);
};

export const remove = async (id: number) => {
  const item = await db.orm.public.Pengurus.where({ id }).delete();
  if (!item) throw new AppError('Pengurus tidak ditemukan', 404);
};