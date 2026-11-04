import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './pengumuman.controller';

const createSchema = z.object({ judul: z.string().trim().min(3), isi: z.string().min(1) });
const updateSchema = createSchema.partial();

const router = Router();
const write = requireRole(...PERMISSIONS.administrasi);

router.get('/', controller.list);
router.get('/:id', validate({ params: idParam }), controller.getById);
router.post('/', write, validate({ body: createSchema }), controller.create);
router.patch('/:id', write, validate({ params: idParam, body: updateSchema }), controller.update);
router.delete('/:id', write, validate({ params: idParam }), controller.remove);

export default router;
