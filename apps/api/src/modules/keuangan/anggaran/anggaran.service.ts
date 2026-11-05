import { db } from '../../../config/database';

export interface AnggaranInput {
  periodeId?: number;
  kegiatanId?: number;
  nama: string;
  jumlah: number;
  keterangan?: string;
}

// Daftar anggaran beserta realisasi (total pengeluaran pada kegiatan terkait).
export const list = async (q: { periodeId?: number; kegiatanId?: number }) => {
  const items = await db.anggaran.findMany({
    where: { ...(q.periodeId ? { periodeId: q.periodeId } : {}), ...(q.kegiatanId ? { kegiatanId: q.kegiatanId } : {}) },
    include: { kegiatan: { select: { id: true, nama: true } } },
    orderBy: { id: 'desc' },
  });
  return Promise.all(
    items.map(async (a) => {
      let realisasi = 0;
      if (a.kegiatanId) {
        const agg = await db.transaksi.aggregate({
          where: { kegiatanId: a.kegiatanId, tipe: 'PENGELUARAN' },
          _sum: { jumlah: true },
        });
        realisasi = Number(agg._sum.jumlah ?? 0);
      }
      const jumlah = Number(a.jumlah);
      return { ...a, jumlah, realisasi, sisa: jumlah - realisasi };
    }),
  );
};

export const create = (input: AnggaranInput) => db.anggaran.create({ data: input });
export const update = (id: number, input: Partial<AnggaranInput>) => db.anggaran.update({ where: { id }, data: input });
export const remove = async (id: number) => {
  await db.anggaran.delete({ where: { id } });
};
