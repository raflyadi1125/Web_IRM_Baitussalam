import { asyncHandler, sendSuccess } from '../../../shared/utils/response';
import * as service from './notulen.service';

export const list = asyncHandler(async (req, res) => {
  const kegiatanId = req.query.kegiatanId ? Number(req.query.kegiatanId) : undefined;
  sendSuccess(res, await service.list(kegiatanId));
});
export const getById = asyncHandler(async (req, res) => sendSuccess(res, await service.getById(Number(req.params.id))));
export const create = asyncHandler(async (req, res) => sendSuccess(res, await service.create(req.body, req.user!.id), 201));
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.update(Number(req.params.id), req.body)),
);
export const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id));
  sendSuccess(res, null);
});
