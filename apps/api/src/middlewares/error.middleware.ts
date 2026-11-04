import type { ErrorRequestHandler } from 'express';
import { Prisma } from 'database';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/app-error';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validasi gagal',
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message, errors: err.details });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const map: Record<string, [number, string]> = {
      P2002: [409, 'Data sudah ada (duplikat)'],
      P2003: [400, 'Relasi data tidak valid atau data masih dipakai'],
      P2025: [404, 'Data tidak ditemukan'],
    };
    const hit = map[err.code];
    if (hit) {
      res.status(hit[0]).json({ success: false, message: hit[1] });
      return;
    }
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, message: 'JSON tidak valid' });
    return;
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
};
