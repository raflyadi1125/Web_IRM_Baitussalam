import { asyncHandler, sendSuccess } from '../../shared/utils/response';
import * as service from './dashboard.service';

export const summary = asyncHandler(async (req, res) => sendSuccess(res, await service.getSummary(req.user!.role)));
