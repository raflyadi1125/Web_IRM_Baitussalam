import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('kegiatan', () => {
  it('GET /kegiatan tanpa token (401)', async () => {
    const res = await request(app).get('/api/v1/kegiatan');
    expect(res.status).toBe(401);
  });

  it('POST /kegiatan tanpa token (401)', async () => {
    const res = await request(app).post('/api/v1/kegiatan').send({ nama: 'Rapat' });
    expect(res.status).toBe(401);
  });
});
