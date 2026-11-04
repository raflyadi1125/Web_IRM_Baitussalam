import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('auth', () => {
  it('menolak register dengan body tidak valid (422)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'x' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('menolak login tanpa password (422)', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(422);
  });

  it('GET /auth/me tanpa token (401)', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('route di bawah prefix API wajib login (401)', async () => {
    const res = await request(app).get('/api/v1/tidak-ada');
    expect(res.status).toBe(401);
  });
});
