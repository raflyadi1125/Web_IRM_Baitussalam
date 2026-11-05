import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/app-error.js';

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

  // Error database dari driver pg (Postgres): kode SQLSTATE
  const pgCode = err?.code ?? err?.cause?.code;
  const pgMap: Record<string, [number, string]> = {
    '23505': [409, 'Data sudah ada (duplikat)'],               // unique_violation
    '23503': [400, 'Relasi data tidak valid atau data masih dipakai'], // foreign_key_violation
  };
  const hit = typeof pgCode === 'string' ? pgMap[pgCode] : undefined;
  if (hit) {
    res.status(hit[0]).json({ success: false, message: hit[1] });
    return;
  }

  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, message: 'JSON tidak valid' });
    return;
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
};