import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './anggaran.controller';

const createSchema = z.object({
  periodeId: z.coerce.number().int().positive().optional(),
  kegiatanId: z.coerce.number().int().positive().optional(),
  nama: z.string().trim().min(3),
  jumlah: z.coerce.number().positive(),
  keterangan: z.string().optional(),
});
const updateSchema = createSchema.partial();
const listQuery = z.object({
  periodeId: z.coerce.number().int().positive().optional(),
  kegiatanId: z.coerce.number().int().positive().optional(),
});

const router = Router();

router.use(requireRole(...PERMISSIONS.keuangan));
router.get('/', validate({ query: listQuery }), controller.list);
router.post('/', validate({ body: createSchema }), controller.create);
router.patch('/:id', validate({ params: idParam, body: updateSchema }), controller.update);
router.delete('/:id', validate({ params: idParam }), controller.remove);

export default router;
