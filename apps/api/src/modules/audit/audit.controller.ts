import { asyncHandler, sendSuccess } from '../../shared/utils/response';
import * as service from './audit.service';

export const list = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, string | undefined>;
  const { items, meta } = await service.list({
    entitas: q.entitas,
    userId: q.userId ? Number(q.userId) : undefined,
    page: q.page ? Number(q.page) : undefined,
    limit: q.limit ? Number(q.limit) : undefined,
  });
  sendSuccess(res, items, 200, meta);
});
