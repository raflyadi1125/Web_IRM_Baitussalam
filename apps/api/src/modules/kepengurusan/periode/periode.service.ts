import { db } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import type { CreatePeriodeInput, UpdatePeriodeInput } from './periode.validation';

// Hanya satu periode yang boleh aktif.
const deactivateOthers = (exceptId?: number) =>
  db.periode.updateMany({ where: { aktif: true, ...(exceptId ? { id: { not: exceptId } } : {}) }, data: { aktif: false } });

export const list = () => db.periode.findMany({ orderBy: { tahunMulai: 'desc' } });

export const getById = async (id: number) => {
  const periode = await db.periode.findUnique({ where: { id }, include: { pengurus: { include: { user: { select: { id: true, nama: true } } } } } });
  if (!periode) throw new AppError('Periode tidak ditemukan', 404);
  return periode;
};

export const create = async (input: CreatePeriodeInput) => {
  if (input.aktif) await deactivateOthers();
  return db.periode.create({ data: input });
};

export const update = async (id: number, input: UpdatePeriodeInput) => {
  if (input.aktif) await deactivateOthers(id);
  return db.periode.update({ where: { id }, data: input });
};

export const remove = async (id: number) => {
  await db.periode.delete({ where: { id } });
};
