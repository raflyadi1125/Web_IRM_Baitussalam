import { asyncHandler, sendSuccess } from '../../shared/utils/response';
import * as service from './absensi.service';

export const list = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.listByKegiatan(Number(req.query.kegiatanId))),
);
export const me = asyncHandler(async (req, res) => sendSuccess(res, await service.myHistory(req.user!.id)));
export const markManual = asyncHandler(async (req, res) => sendSuccess(res, await service.markManual(req.body), 201));
export const qr = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.qrForKegiatan(Number(req.params.kegiatanId))),
);
export const scan = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.scan(req.body.token, req.user!.id), 201),
);
export const rekap = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.rekap(Number(req.params.kegiatanId))),
);
