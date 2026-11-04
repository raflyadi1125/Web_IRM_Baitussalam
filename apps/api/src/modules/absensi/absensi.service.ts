import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import { generateQr, verifyQrToken } from './qr.service';
import type { ManualAbsensiInput } from './absensi.validation';

export const listByKegiatan = (kegiatanId: number) =>
  prisma.absensi.findMany({
    where: { kegiatanId },
    include: { user: { select: { id: true, nama: true } } },
    orderBy: { waktu: 'asc' },
  });

export const myHistory = (userId: number) =>
  prisma.absensi.findMany({
    where: { userId },
    include: { kegiatan: { select: { id: true, nama: true, tanggalMulai: true } } },
    orderBy: { waktu: 'desc' },
  });

export const markManual = (input: ManualAbsensiInput) =>
  prisma.absensi.upsert({
    where: { kegiatanId_userId: { kegiatanId: input.kegiatanId, userId: input.userId } },
    create: { ...input, metode: 'MANUAL' },
    update: { status: input.status, keterangan: input.keterangan, metode: 'MANUAL', waktu: new Date() },
  });

export const qrForKegiatan = async (kegiatanId: number) => {
  const kegiatan = await prisma.kegiatan.findUnique({ where: { id: kegiatanId } });
  if (!kegiatan) throw new AppError('Kegiatan tidak ditemukan', 404);
  return generateQr(kegiatanId);
};

export const scan = async (token: string, userId: number) => {
  const kegiatanId = verifyQrToken(token);
  const kegiatan = await prisma.kegiatan.findUnique({ where: { id: kegiatanId } });
  if (!kegiatan) throw new AppError('Kegiatan tidak ditemukan', 404);
  if (kegiatan.status === 'BATAL' || kegiatan.status === 'SELESAI') {
    throw new AppError('Kegiatan sudah tidak menerima absensi', 400);
  }
  return prisma.absensi.upsert({
    where: { kegiatanId_userId: { kegiatanId, userId } },
    create: { kegiatanId, userId, status: 'HADIR', metode: 'QR' },
    update: { status: 'HADIR', metode: 'QR', waktu: new Date() },
  });
};

export const rekap = async (kegiatanId: number) => {
  const rows = await prisma.absensi.groupBy({ by: ['status'], where: { kegiatanId }, _count: { _all: true } });
  const result: Record<string, number> = { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 };
  for (const r of rows) result[r.status] = r._count._all;
  return result;
};
