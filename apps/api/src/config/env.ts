import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';


const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(here, '../../../../packages/database/.env') });
config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET wajib diisi di .env (minimal 16 karakter)'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  QR_TOKEN_TTL_SECONDS: z.coerce.number().default(300),
});

export const env = schema.parse(process.env);