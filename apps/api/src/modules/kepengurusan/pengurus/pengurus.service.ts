import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import type { CreatePengurusInput, UpdatePengurusInput } from './pengurus.validation';

const include = {
  user: { select: { id: true, nama: true, email: true } },
  periode: { select: { id: true, nama: true } },
};

export const list = (periodeId?: number) =>
  prisma.pengurus.findMany({ where: periodeId ? { periodeId } : {}, include, orderBy: { id: 'asc' } });

export const getById = async (id: number) => {
  const item = await prisma.pengurus.findUnique({ where: { id }, include });
  if (!item) throw new AppError('Pengurus tidak ditemukan', 404);
  return item;
};

export const create = (input: CreatePengurusInput) => prisma.pengurus.create({ data: input, include });
export const update = (id: number, input: UpdatePengurusInput) => prisma.pengurus.update({ where: { id }, data: input, include });
export const remove = async (id: number) => {
  await prisma.pengurus.delete({ where: { id } });
};
