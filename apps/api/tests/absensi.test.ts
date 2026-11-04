import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('absensi', () => {
  it('POST /absensi/scan tanpa token (401)', async () => {
    const res = await request(app).post('/api/v1/absensi/scan').send({ token: 'abc' });
    expect(res.status).toBe(401);
  });
});
