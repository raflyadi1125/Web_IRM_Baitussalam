import { prisma } from '../../config/database';
import { PERMISSIONS } from '../../shared/constants/permissions';
import type { Role } from '../../shared/constants/roles';

export const getSummary = async (role: Role) => {
  const [anggotaAktif, kegiatanGroup, mendatang, pengumuman, absensiGroup] = await Promise.all([
    prisma.user.count({ where: { aktif: true } }),
    prisma.kegiatan.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.kegiatan.findMany({
      where: { tanggalMulai: { gte: new Date() }, status: { not: 'BATAL' } },
      orderBy: { tanggalMulai: 'asc' },
      take: 5,
      select: { id: true, nama: true, tanggalMulai: true, lokasi: true },
    }),
    prisma.pengumuman.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, judul: true, createdAt: true } }),
    prisma.absensi.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const kegiatan: Record<string, number> = { DRAFT: 0, BERJALAN: 0, SELESAI: 0, BATAL: 0 };
  for (const g of kegiatanGroup) kegiatan[g.status] = g._count._all;

  const absensi: Record<string, number> = { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 };
  for (const g of absensiGroup) absensi[g.status] = g._count._all;
  const totalAbsensi = Object.values(absensi).reduce((a, b) => a + b, 0);

  const summary: Record<string, unknown> = {
    anggotaAktif,
    kegiatan,
    kegiatanMendatang: mendatang,
    pengumumanTerbaru: pengumuman,
    absensi: { ...absensi, persentaseKehadiran: totalAbsensi ? Math.round((absensi.HADIR / totalAbsensi) * 100) : 0 },
  };

  // Data keuangan hanya untuk peran yang berwenang.
  if ((PERMISSIONS.keuangan as readonly Role[]).includes(role)) {
    const [masuk, keluar, iuranBelum] = await Promise.all([
      prisma.transaksi.aggregate({ where: { tipe: 'PEMASUKAN' }, _sum: { jumlah: true } }),
      prisma.transaksi.aggregate({ where: { tipe: 'PENGELUARAN' }, _sum: { jumlah: true } }),
      prisma.iuran.count({ where: { status: 'BELUM' } }),
    ]);
    const pemasukan = Number(masuk._sum.jumlah ?? 0);
    const pengeluaran = Number(keluar._sum.jumlah ?? 0);
    summary.keuangan = { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran, iuranBelumLunas: iuranBelum };
  }
  return summary;
};
