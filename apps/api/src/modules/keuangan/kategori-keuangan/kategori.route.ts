import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './kategori.controller';

const tipe = z.enum(['PEMASUKAN', 'PENGELUARAN']);
const createSchema = z.object({ nama: z.string().trim().min(2), tipe });
const updateSchema = createSchema.partial();

const router = Router();
const access = requireRole(...PERMISSIONS.keuangan);

router.use(access);
router.get('/', validate({ query: z.object({ tipe: tipe.optional() }) }), controller.list);
router.post('/', validate({ body: createSchema }), controller.create);
router.patch('/:id', validate({ params: idParam, body: updateSchema }), controller.update);
router.delete('/:id', validate({ params: idParam }), controller.remove);

export default router;
