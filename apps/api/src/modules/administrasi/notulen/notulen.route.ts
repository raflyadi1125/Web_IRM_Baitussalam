import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './notulen.controller';

const createSchema = z.object({
  kegiatanId: z.coerce.number().int().positive().optional(),
  judul: z.string().trim().min(3),
  isi: z.string().min(1),
  tanggal: z.coerce.date(),
});
const updateSchema = createSchema.partial();
const listQuery = z.object({ kegiatanId: z.coerce.number().int().positive().optional() });

const router = Router();
const write = requireRole(...PERMISSIONS.administrasi);

router.get('/', validate({ query: listQuery }), controller.list);
router.get('/:id', validate({ params: idParam }), controller.getById);
router.post('/', write, validate({ body: createSchema }), controller.create);
router.patch('/:id', write, validate({ params: idParam, body: updateSchema }), controller.update);
router.delete('/:id', write, validate({ params: idParam }), controller.remove);

export default router;
