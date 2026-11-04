import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import * as controller from './auth.controller';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

router.post('/register', validate({ body: registerSchema }), controller.register);
router.post('/login', validate({ body: loginSchema }), controller.login);
router.get('/me', authenticate, controller.me);

export default router;
