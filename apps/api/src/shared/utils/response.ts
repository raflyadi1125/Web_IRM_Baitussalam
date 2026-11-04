import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const sendSuccess = (res: Response, data: unknown, status = 200, meta?: unknown) =>
  res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
