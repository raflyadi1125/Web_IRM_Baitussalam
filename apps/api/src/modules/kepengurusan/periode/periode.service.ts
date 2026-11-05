import { all, and, db } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import type { CreatePeriodeInput, UpdatePeriodeInput } from './periode.validation';

const assertRange = (mulai: Date, selesai: Date) => {
  if (selesai <= mulai) throw new AppError('Tanggal selesai harus setelah tanggal mulai', 422);
};

export const list = () =>
  db.orm.public.PeriodeKepengurusan.orderBy((p) => p.mulai.desc()).all();

export const getById = async (id: number) => {
  const periode = await db.orm.public.PeriodeKepengurusan.where({ id }).first();
  if (!periode) throw new AppError('Periode tidak ditemukan', 404);

  const pengurus = await db.orm.public.Pengurus.where({ periodeId: id })
    .include('user', (u) => u.select('id', 'nama'))
    .all();

  return { ...periode, pengurus };
};

export const create = async (input: CreatePeriodeInput) => {
  assertRange(input.mulai, input.selesai);
  const exists = await db.orm.public.PeriodeKepengurusan.where({ nama: input.nama }).first();
  if (exists) throw new AppError('Nama periode sudah dipakai', 409);

  // Hanya satu periode yang boleh aktif: nonaktifkan yang lain dalam satu transaksi.
  return db.transaction(async (tx) => {
    if (input.aktif) {
      await tx.orm.public.PeriodeKepengurusan.where({ aktif: true }).updateAndCount({ aktif: false });
    }
    return tx.orm.public.PeriodeKepengurusan.create(input);
  });
};

export const update = async (id: number, input: UpdatePeriodeInput) => {
  if (Object.keys(input).length === 0) throw new AppError('Tidak ada data yang diubah', 400);

  const current = await db.orm.public.PeriodeKepengurusan.where({ id }).first();
  if (!current) throw new AppError('Periode tidak ditemukan', 404);

  assertRange(input.mulai ?? current.mulai, input.selesai ?? current.selesai);

  if (input.nama && input.nama !== current.nama) {
    const clash = await db.orm.public.PeriodeKepengurusan.where({ nama: input.nama }).first();
    if (clash) throw new AppError('Nama periode sudah dipakai', 409);
  }

  return db.transaction(async (tx) => {
    if (input.aktif) {
      await tx.orm.public.PeriodeKepengurusan
        .where((p) => and(p.aktif.eq(true), p.id.neq(id)))
        .updateAndCount({ aktif: false });
    }
    return tx.orm.public.PeriodeKepengurusan.where({ id }).update(input);
  });
};

export const remove = async (id: number) => {
  const removed = await db.orm.public.PeriodeKepengurusan.where({ id }).delete();
  if (!removed) throw new AppError('Periode tidak ditemukan', 404);
};