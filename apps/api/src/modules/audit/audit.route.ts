import { Router } from 'express';
import { requireRole } from '../../middlewares/role.middleware';
import { PERMISSIONS } from '../../shared/constants/permissions';
import * as controller from './audit.controller';

const router = Router();

router.get('/', requireRole(...PERMISSIONS.viewAudit), controller.list);

export default router;
