import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './iuran.controller';

const bulan = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format bulan: YYYY-MM');
const createSchema = z.object({
  userId: z.coerce.number().int().positive(),
  bulan,
  jumlah: z.coerce.number().positive(),
});
const generateSchema = z.object({ bulan, jumlah: z.coerce.number().positive() });
const listQuery = z.object({
  bulan: bulan.optional(),
  userId: z.coerce.number().int().positive().optional(),
  status: z.enum(['BELUM', 'LUNAS']).optional(),
});

const router = Router();
const manage = requireRole(...PERMISSIONS.keuangan);

router.get('/me', controller.me);
router.get('/', manage, validate({ query: listQuery }), controller.list);
router.post('/', manage, validate({ body: createSchema }), controller.create);
router.post('/generate', manage, validate({ body: generateSchema }), controller.generate);
router.patch('/:id/bayar', manage, validate({ params: idParam }), controller.bayar);
router.delete('/:id', manage, validate({ params: idParam }), controller.remove);

export default router;
