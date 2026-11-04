import { asyncHandler, sendSuccess } from '../../shared/utils/response';
import * as service from './feedback.service';
import type { ListFeedbackQuery } from './feedback.validation';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query as unknown as ListFeedbackQuery);
  sendSuccess(res, items, 200, meta);
});
export const create = asyncHandler(async (req, res) => sendSuccess(res, await service.create(req.body, req.user!.id), 201));
export const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id));
  sendSuccess(res, null);
});
