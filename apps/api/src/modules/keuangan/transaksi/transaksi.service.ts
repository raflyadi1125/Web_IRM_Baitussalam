import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import { buildMeta } from '../../../shared/utils/pagination';
import { logAudit } from '../../audit/audit.service';
import type { CreateTransaksiInput, ListTransaksiQuery, UpdateTransaksiInput } from './transaksi.validation';

const include = {
  kategori: { select: { id: true, nama: true } },
  kegiatan: { select: { id: true, nama: true } },
};

const buildWhere = (q: Partial<ListTransaksiQuery>) => ({
  ...(q.tipe ? { tipe: q.tipe } : {}),
  ...(q.kategoriId ? { kategoriId: q.kategoriId } : {}),
  ...(q.kegiatanId ? { kegiatanId: q.kegiatanId } : {}),
  ...(q.dari || q.sampai ? { tanggal: { ...(q.dari ? { gte: q.dari } : {}), ...(q.sampai ? { lte: q.sampai } : {}) } } : {}),
});

export const list = async (q: ListTransaksiQuery) => {
  const where = buildWhere(q);
  const [items, total] = await prisma.$transaction([
    prisma.transaksi.findMany({ where, include, skip: (q.page - 1) * q.limit, take: q.limit, orderBy: { tanggal: 'desc' } }),
    prisma.transaksi.count({ where }),
  ]);
  return { items, meta: buildMeta(q.page, q.limit, total) };
};

export const ringkasan = async (q: Partial<ListTransaksiQuery>) => {
  const where = buildWhere({ ...q, tipe: undefined });
  const [masuk, keluar] = await Promise.all([
    prisma.transaksi.aggregate({ where: { ...where, tipe: 'PEMASUKAN' }, _sum: { jumlah: true } }),
    prisma.transaksi.aggregate({ where: { ...where, tipe: 'PENGELUARAN' }, _sum: { jumlah: true } }),
  ]);
  const totalPemasukan = Number(masuk._sum.jumlah ?? 0);
  const totalPengeluaran = Number(keluar._sum.jumlah ?? 0);
  return { totalPemasukan, totalPengeluaran, saldo: totalPemasukan - totalPengeluaran };
};

export const getById = async (id: number) => {
  const item = await prisma.transaksi.findUnique({ where: { id }, include });
  if (!item) throw new AppError('Transaksi tidak ditemukan', 404);
  return item;
};

export const create = async (input: CreateTransaksiInput, actorId: number) => {
  const item = await prisma.transaksi.create({ data: { ...input, createdById: actorId }, include });
  await logAudit(actorId, 'CREATE', 'Transaksi', item.id, { tipe: item.tipe, jumlah: Number(item.jumlah) });
  return item;
};

export const update = async (id: number, input: UpdateTransaksiInput, actorId: number) => {
  const item = await prisma.transaksi.update({ where: { id }, data: input, include });
  await logAudit(actorId, 'UPDATE', 'Transaksi', id, { fields: Object.keys(input) });
  return item;
};

export const remove = async (id: number, actorId: number) => {
  await prisma.transaksi.delete({ where: { id } });
  await logAudit(actorId, 'DELETE', 'Transaksi', id);
};
