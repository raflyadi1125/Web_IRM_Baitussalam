import type { RequestHandler } from 'express';
import { AppError } from '../shared/errors/app-error';
import type { Role } from '../shared/constants/roles';

export const requireRole =
  (...roles: readonly Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new AppError('Tidak terautentikasi', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('Akses ditolak', 403));
    next();
  };
