import { Router } from 'express';
import { requireRole } from '../../middlewares/role.middleware';
import { idParam, validate } from '../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../shared/constants/permissions';
import * as controller from './panitia.controller';
import { createPanitiaSchema, listPanitiaQuery, updatePanitiaSchema } from './panitia.validation';

const router = Router();
const write = requireRole(...PERMISSIONS.manageKegiatan);

router.get('/', validate({ query: listPanitiaQuery }), controller.list);
router.post('/', write, validate({ body: createPanitiaSchema }), controller.create);
router.patch('/:id', write, validate({ params: idParam, body: updatePanitiaSchema }), controller.update);
router.delete('/:id', write, validate({ params: idParam }), controller.remove);

export default router;
