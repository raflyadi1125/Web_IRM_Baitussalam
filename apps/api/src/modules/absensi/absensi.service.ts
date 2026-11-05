import { db } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import { generateQr, verifyQrToken } from './qr.service';
import type { ManualAbsensiInput } from './absensi.validation';

export const listByKegiatan = async (kegiatanId: number) =>
  db.orm.public.Absensi.where({ kegiatanId })
    .include('user', (u) => u.select('id', 'nama'))
    .orderBy((a) => a.waktuHadir.asc())
    .all();

export const myHistory = async (userId: number) =>
  db.orm.public.Absensi.where({ userId })
    .include('kegiatan', (k) => k.select('id', 'judul', 'tanggalMulai'))
    .orderBy((a) => a.waktuHadir.desc())
    .all();

// actorId = sekretaris/admin yang menginput manual (kolom dicatatOlehId).
export const markManual = async (input: ManualAbsensiInput, actorId?: number) => {
  const pencatat = actorId ? { dicatatOlehId: actorId } : {};
  return db.orm.public.Absensi.upsert({
    create: {
      kegiatanId: input.kegiatanId,
      userId: input.userId,
      status: input.status,
      keterangan: input.keterangan ?? null,
      metode: 'MANUAL',
      ...pencatat,
    },
    update: {
      status: input.status,
      keterangan: input.keterangan ?? null,
      metode: 'MANUAL',
      waktuHadir: new Date(),
      ...pencatat,
    },
    conflictOn: { kegiatanId: input.kegiatanId, userId: input.userId },
  });
};

export const qrForKegiatan = async (kegiatanId: number) => {
  const kegiatan = await db.orm.public.Kegiatan.where({ id: kegiatanId }).first();
  if (!kegiatan) throw new AppError('Kegiatan tidak ditemukan', 404);
  return generateQr(kegiatanId);
};

export const scan = async (token: string, userId: number) => {
  const kegiatanId = verifyQrToken(token);
  const kegiatan = await db.orm.public.Kegiatan.where({ id: kegiatanId }).first();
  if (!kegiatan) throw new AppError('Kegiatan tidak ditemukan', 404);
  if (kegiatan.status === 'DIBATALKAN' || kegiatan.status === 'SELESAI') {
    throw new AppError('Kegiatan sudah tidak menerima absensi', 400);
  }
  return db.orm.public.Absensi.upsert({
    create: { kegiatanId, userId, status: 'HADIR', metode: 'QR' },
    update: { status: 'HADIR', metode: 'QR', waktuHadir: new Date() },
    conflictOn: { kegiatanId, userId },
  });
};

export const rekap = async (kegiatanId: number) => {
  const rows = await db.orm.public.Absensi.where({ kegiatanId })
    .groupBy('status')
    .aggregate((a) => ({ jumlah: a.count() }));
  const result: Record<string, number> = { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 };
  for (const r of rows) result[r.status] = r.jumlah;
  return result;
};