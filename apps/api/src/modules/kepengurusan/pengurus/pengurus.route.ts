import { Router } from 'express';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './pengurus.controller';
import { createPengurusSchema, listPengurusQuery, updatePengurusSchema } from './pengurus.validation';

const router = Router();
const write = requireRole(...PERMISSIONS.manageKepengurusan);

router.get('/', validate({ query: listPengurusQuery }), controller.list);
router.get('/:id', validate({ params: idParam }), controller.getById);
router.post('/', write, validate({ body: createPengurusSchema }), controller.create);
router.patch('/:id', write, validate({ params: idParam, body: updatePengurusSchema }), controller.update);
router.delete('/:id', write, validate({ params: idParam }), controller.remove);

export default router;
