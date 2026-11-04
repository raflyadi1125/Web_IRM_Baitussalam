import { Router } from 'express';
import { requireRole } from '../../../middlewares/role.middleware';
import { idParam, validate } from '../../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import * as controller from './transaksi.controller';
import { createTransaksiSchema, listTransaksiQuery, updateTransaksiSchema } from './transaksi.validation';

const router = Router();

router.use(requireRole(...PERMISSIONS.keuangan));
router.get('/', validate({ query: listTransaksiQuery }), controller.list);
router.get('/ringkasan', validate({ query: listTransaksiQuery }), controller.ringkasan);
router.get('/:id', validate({ params: idParam }), controller.getById);
router.post('/', validate({ body: createTransaksiSchema }), controller.create);
router.patch('/:id', validate({ params: idParam, body: updateTransaksiSchema }), controller.update);
router.delete('/:id', validate({ params: idParam }), controller.remove);

export default router;
