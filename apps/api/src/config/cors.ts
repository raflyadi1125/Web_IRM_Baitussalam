import type { CorsOptions } from 'cors';
import { env } from './env';

const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

export const corsOptions: CorsOptions = {
  origin: origins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
};
