import { asyncHandler, sendSuccess } from '../../../shared/utils/response';
import * as service from './periode.service';

export const list = asyncHandler(async (_req, res) => sendSuccess(res, await service.list()));
export const getById = asyncHandler(async (req, res) => sendSuccess(res, await service.getById(Number(req.params.id))));
export const create = asyncHandler(async (req, res) => sendSuccess(res, await service.create(req.body), 201));
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.update(Number(req.params.id), req.body)),
);
export const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id));
  sendSuccess(res, null);
});
