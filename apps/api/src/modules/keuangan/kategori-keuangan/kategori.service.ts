import { db } from '../../../config/database';

export interface KategoriInput {
  nama: string;
  tipe: 'PEMASUKAN' | 'PENGELUARAN';
}

export const list = (tipe?: 'PEMASUKAN' | 'PENGELUARAN') =>
  db.kategoriKeuangan.findMany({ where: tipe ? { tipe } : {}, orderBy: { nama: 'asc' } });
export const create = (input: KategoriInput) => db.kategoriKeuangan.create({ data: input });
export const update = (id: number, input: Partial<KategoriInput>) => db.kategoriKeuangan.update({ where: { id }, data: input });
export const remove = async (id: number) => {
  await db.kategoriKeuangan.delete({ where: { id } });
};
