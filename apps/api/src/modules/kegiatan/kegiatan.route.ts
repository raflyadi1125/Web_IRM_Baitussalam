import { Router } from 'express';
import { requireRole } from '../../middlewares/role.middleware';
import { idParam, validate } from '../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../shared/constants/permissions';
import * as controller from './kegiatan.controller';
import { createKegiatanSchema, listKegiatanQuery, updateKegiatanSchema } from './kegiatan.validation';

const router = Router();
const write = requireRole(...PERMISSIONS.manageKegiatan);

router.get('/', validate({ query: listKegiatanQuery }), controller.list);
router.get('/:id', validate({ params: idParam }), controller.getById);
router.post('/', write, validate({ body: createKegiatanSchema }), controller.create);
router.patch('/:id', write, validate({ params: idParam, body: updateKegiatanSchema }), controller.update);
router.delete('/:id', write, validate({ params: idParam }), controller.remove);

export default router;
