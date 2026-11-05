import { db } from '../../../config/database';
import { AppError } from '../../../shared/errors/app-error';
import { logAudit } from '../../audit/audit.service';

const include = { user: { select: { id: true, nama: true } } };

export const list = (q: { bulan?: string; userId?: number; status?: 'BELUM' | 'LUNAS' }) =>
  db.iuran.findMany({
    where: { ...(q.bulan ? { bulan: q.bulan } : {}), ...(q.userId ? { userId: q.userId } : {}), ...(q.status ? { status: q.status } : {}) },
    include,
    orderBy: [{ bulan: 'desc' }, { userId: 'asc' }],
  });

export const myIuran = (userId: number) => db.iuran.findMany({ where: { userId }, orderBy: { bulan: 'desc' } });

export const create = (input: { userId: number; bulan: string; jumlah: number }) => db.iuran.create({ data: input, include });

// Buat tagihan iuran untuk semua anggota aktif pada bulan tertentu.
export const generate = async (bulan: string, jumlah: number, actorId: number) => {
  const users = await db.user.findMany({ where: { aktif: true, role: { not: 'ADMIN' } }, select: { id: true } });
  const result = await db.iuran.createMany({
    data: users.map((u) => ({ userId: u.id, bulan, jumlah })),
    skipDuplicates: true,
  });
  await logAudit(actorId, 'GENERATE', 'Iuran', undefined, { bulan, jumlah, dibuat: result.count });
  return { dibuat: result.count, totalAnggota: users.length };
};

export const bayar = async (id: number, actorId: number) => {
  const existing = await db.iuran.findUnique({ where: { id } });
  if (!existing) throw new AppError('Iuran tidak ditemukan', 404);
  if (existing.status === 'LUNAS') throw new AppError('Iuran sudah lunas', 400);
  const item = await db.iuran.update({ where: { id }, data: { status: 'LUNAS', tanggalBayar: new Date() }, include });
  await logAudit(actorId, 'BAYAR', 'Iuran', id, { bulan: item.bulan, jumlah: Number(item.jumlah) });
  return item;
};

export const remove = async (id: number) => {
  await db.iuran.delete({ where: { id } });
};
