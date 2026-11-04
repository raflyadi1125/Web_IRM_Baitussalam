import { Router } from 'express';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './periode.controller';
import { createPeriodeSchema, updatePeriodeSchema } from './periode.validation';

const router = Router();
const write = requireRole(...PERMISSIONS.manageKepengurusan);

router.get('/', controller.list);
router.get('/:id', validate({ params: idParam }), controller.getById);
router.post('/', write, validate({ body: createPeriodeSchema }), controller.create);
router.patch('/:id', write, validate({ params: idParam, body: updatePeriodeSchema }), controller.update);
router.delete('/:id', write, validate({ params: idParam }), controller.remove);

export default router;
