import { Router } from 'express';
import { requireRole } from '../../middlewares/role.middleware';
import { idParam, validate } from '../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../shared/constants/permissions';
import * as controller from './user.controller';
import { createUserSchema, listUserQuery, updateUserSchema } from './user.validation';

const router = Router();
const read = requireRole(...PERMISSIONS.manageKepengurusan);
const write = requireRole(...PERMISSIONS.manageUsers);

router.get('/', read, validate({ query: listUserQuery }), controller.list);
router.get('/:id', read, validate({ params: idParam }), controller.getById);
router.post('/', write, validate({ body: createUserSchema }), controller.create);
router.patch('/:id', write, validate({ params: idParam, body: updateUserSchema }), controller.update);
router.delete('/:id', write, validate({ params: idParam }), controller.remove);

export default router;
