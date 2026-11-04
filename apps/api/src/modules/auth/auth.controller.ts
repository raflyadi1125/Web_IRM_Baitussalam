import { asyncHandler, sendSuccess } from '../../shared/utils/response';
import * as service from './auth.service';

export const register = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.register(req.body), 201);
});

export const login = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.login(req.body));
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.me(req.user!.id));
});
