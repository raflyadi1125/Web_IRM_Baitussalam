import { asyncHandler, sendSuccess } from '../../shared/utils/response';
import * as service from './kegiatan.service';
import type { ListKegiatanQuery } from './kegiatan.validation';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query as unknown as ListKegiatanQuery);
  sendSuccess(res, items, 200, meta);
});
export const getById = asyncHandler(async (req, res) => sendSuccess(res, await service.getById(Number(req.params.id))));
export const create = asyncHandler(async (req, res) => sendSuccess(res, await service.create(req.body, req.user!.id), 201));
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.update(Number(req.params.id), req.body, req.user!.id)),
);
export const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id), req.user!.id);
  sendSuccess(res, null);
});
