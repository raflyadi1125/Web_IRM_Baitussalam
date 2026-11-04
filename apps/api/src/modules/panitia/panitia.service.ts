import { prisma } from '../../config/database';
import type { CreatePanitiaInput } from './panitia.validation';

const include = { user: { select: { id: true, nama: true, email: true } } };

export const listByKegiatan = (kegiatanId: number) =>
  prisma.panitia.findMany({ where: { kegiatanId }, include, orderBy: { id: 'asc' } });

export const create = (input: CreatePanitiaInput) => prisma.panitia.create({ data: input, include });

export const update = (id: number, jabatan: string) => prisma.panitia.update({ where: { id }, data: { jabatan }, include });

export const remove = async (id: number) => {
  await prisma.panitia.delete({ where: { id } });
};
