import { Router } from 'express';
import { requireRole } from '../../middlewares/role.middleware';
import { idParam, validate } from '../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../shared/constants/permissions';
import * as controller from './feedback.controller';
import { createFeedbackSchema, listFeedbackQuery } from './feedback.validation';

const router = Router();

router.post('/', validate({ body: createFeedbackSchema }), controller.create);
router.get('/', requireRole(...PERMISSIONS.manageKegiatan), validate({ query: listFeedbackQuery }), controller.list);
router.delete('/:id', requireRole(...PERMISSIONS.manageUsers), validate({ params: idParam }), controller.remove);

export default router;
