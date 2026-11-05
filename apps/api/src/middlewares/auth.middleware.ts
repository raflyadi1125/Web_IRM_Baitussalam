import type { RequestHandler } from 'express';
import { AppError } from '../shared/errors/app-error';
import { verifyToken } from '../shared/utils/jwt';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new AppError('Token tidak ditemukan', 401));
  try {
    const payload = verifyToken(header.slice(7));
    req.user = { id: payload.uid, role: payload.role, email: payload.email };
    next();
  } catch {
    next(new AppError('Token tidak valid atau kedaluwarsa', 401));
  }
};