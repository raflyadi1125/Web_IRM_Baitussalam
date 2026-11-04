import { asyncHandler, sendSuccess } from '../../../shared/utils/response';
import * as service from './kategori.service';

export const list = asyncHandler(async (req, res) => sendSuccess(res, await service.list(req.query.tipe as never)));
export const create = asyncHandler(async (req, res) => sendSuccess(res, await service.create(req.body), 201));
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.update(Number(req.params.id), req.body)),
);
export const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id));
  sendSuccess(res, null);
});
