import { prisma } from '../../../config/database';

export interface KategoriInput {
  nama: string;
  tipe: 'PEMASUKAN' | 'PENGELUARAN';
}

export const list = (tipe?: 'PEMASUKAN' | 'PENGELUARAN') =>
  prisma.kategoriKeuangan.findMany({ where: tipe ? { tipe } : {}, orderBy: { nama: 'asc' } });
export const create = (input: KategoriInput) => prisma.kategoriKeuangan.create({ data: input });
export const update = (id: number, input: Partial<KategoriInput>) => prisma.kategoriKeuangan.update({ where: { id }, data: input });
export const remove = async (id: number) => {
  await prisma.kategoriKeuangan.delete({ where: { id } });
};
