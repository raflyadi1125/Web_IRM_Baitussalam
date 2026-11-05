import { db } from '../../config/database';
import { PERMISSIONS } from '../../shared/constants/permissions';
import type { Role } from '../../shared/constants/roles';

export const getSummary = async (role: Role) => {
  const [anggotaAktif, kegiatanGroup, mendatang, pengumuman, absensiGroup] = await Promise.all([
    db.orm.public.User.where({ status: 'AKTIF' }).aggregate((a) => ({ total: a.count() })),
    db.orm.public.Kegiatan.groupBy('status').aggregate((a) => ({ jumlah: a.count() })),
    db.orm.public.Kegiatan.select('id', 'judul', 'tanggalMulai', 'lokasi')
      .where((k) => k.tanggalMulai.gte(new Date()))
      .where((k) => k.status.neq('DIBATALKAN'))
      .orderBy((k) => k.tanggalMulai.asc())
      .limit(5)
      .all(),
    db.orm.public.Pengumuman.select('id', 'judul', 'createdAt')
      .orderBy((p) => p.createdAt.desc())
      .limit(5)
      .all(),
    db.orm.public.Absensi.groupBy('status').aggregate((a) => ({ jumlah: a.count() })),
  ]);

  const kegiatan: Record<string, number> = {
    DRAFT: 0,
    DIJADWALKAN: 0,
    BERLANGSUNG: 0,
    SELESAI: 0,
    DIBATALKAN: 0,
  };
  for (const g of kegiatanGroup) kegiatan[g.status] = g.jumlah;

  const absensi: Record<string, number> = { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 };
  for (const g of absensiGroup) absensi[g.status] = g.jumlah;
  const totalAbsensi = Object.values(absensi).reduce((a, b) => a + b, 0);

  const summary: Record<string, unknown> = {
    anggotaAktif: anggotaAktif.total,
    kegiatan,
    kegiatanMendatang: mendatang,
    pengumumanTerbaru: pengumuman,
    absensi: {
      ...absensi,
      persentaseKehadiran: totalAbsensi ? Math.round((absensi.HADIR / totalAbsensi) * 100) : 0,
    },
  };

  // Data keuangan hanya untuk peran yang berwenang.
  if ((PERMISSIONS.keuangan as readonly Role[]).includes(role)) {
    const [masuk, keluar, iuranBelum] = await Promise.all([
      db.orm.public.Transaksi.where({ jenis: 'PEMASUKAN', status: 'DISETUJUI' }).aggregate((a) => ({
        total: a.sum('jumlah'),
      })),
      db.orm.public.Transaksi.where({ jenis: 'PENGELUARAN', status: 'DISETUJUI' }).aggregate((a) => ({
        total: a.sum('jumlah'),
      })),
      db.orm.public.Iuran.where({ status: 'BELUM_BAYAR' }).aggregate((a) => ({ total: a.count() })),
    ]);
    // sum() atas kolom desimal mengembalikan string (atau null bila kosong).
    const pemasukan = Number(masuk.total ?? 0);
    const pengeluaran = Number(keluar.total ?? 0);
    summary.keuangan = {
      pemasukan,
      pengeluaran,
      saldo: pemasukan - pengeluaran,
      iuranBelumLunas: iuranBelum.total,
    };
  }
  return summary;
};