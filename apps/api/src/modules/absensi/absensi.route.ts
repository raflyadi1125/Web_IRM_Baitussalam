import { Router } from 'express';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { PERMISSIONS } from '../../shared/constants/permissions';
import * as controller from './absensi.controller';
import { kegiatanIdParam, listAbsensiQuery, manualAbsensiSchema, scanAbsensiSchema } from './absensi.validation';

const router = Router();
const manage = requireRole(...PERMISSIONS.manageKegiatan);

router.get('/me', controller.me);
router.post('/scan', validate({ body: scanAbsensiSchema }), controller.scan);
router.get('/', manage, validate({ query: listAbsensiQuery }), controller.list);
router.post('/', manage, validate({ body: manualAbsensiSchema }), controller.markManual);
router.get('/kegiatan/:kegiatanId/qr', manage, validate({ params: kegiatanIdParam }), controller.qr);
router.get('/kegiatan/:kegiatanId/rekap', manage, validate({ params: kegiatanIdParam }), controller.rekap);

export default router;
