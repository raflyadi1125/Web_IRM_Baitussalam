import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('keuangan', () => {
  it('GET /transaksi tanpa token (401)', async () => {
    const res = await request(app).get('/api/v1/transaksi');
    expect(res.status).toBe(401);
  });

  it('GET /iuran/me tanpa token (401)', async () => {
    const res = await request(app).get('/api/v1/iuran/me');
    expect(res.status).toBe(401);
  });
});
