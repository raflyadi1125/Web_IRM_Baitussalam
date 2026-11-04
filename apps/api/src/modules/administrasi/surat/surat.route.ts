import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './surat.controller';

const createSchema = z.object({
  nomor: z.string().trim().min(1),
  jenis: z.enum(['MASUK', 'KELUAR']),
  perihal: z.string().trim().min(3),
  pengirim: z.string().optional(),
  tujuan: z.string().optional(),
  tanggal: z.coerce.date(),
  isi: z.string().optional(),
  fileUrl: z.string().url().optional(),
});
const updateSchema = createSchema.partial();
const listQuery = z.object({
  jenis: z.enum(['MASUK', 'KELUAR']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const router = Router();
const access = requireRole(...PERMISSIONS.administrasi);

router.use(access);
router.get('/', validate({ query: listQuery }), controller.list);
router.get('/:id', validate({ params: idParam }), controller.getById);
router.post('/', validate({ body: createSchema }), controller.create);
router.patch('/:id', validate({ params: idParam, body: updateSchema }), controller.update);
router.delete('/:id', validate({ params: idParam }), controller.remove);

export default router;
