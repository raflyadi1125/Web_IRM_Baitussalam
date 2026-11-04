import { asyncHandler, sendSuccess } from '../../../shared/utils/response';
import * as service from './iuran.service';

export const list = asyncHandler(async (req, res) => sendSuccess(res, await service.list(req.query as never)));
export const me = asyncHandler(async (req, res) => sendSuccess(res, await service.myIuran(req.user!.id)));
export const create = asyncHandler(async (req, res) => sendSuccess(res, await service.create(req.body), 201));
export const generate = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.generate(req.body.bulan, req.body.jumlah, req.user!.id), 201),
);
export const bayar = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.bayar(Number(req.params.id), req.user!.id)),
);
export const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id));
  sendSuccess(res, null);
});
