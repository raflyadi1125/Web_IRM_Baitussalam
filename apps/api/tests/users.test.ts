import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('users', () => {
  it('GET /users tanpa token (401)', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });

  it('token palsu ditolak (401)', async () => {
    const res = await request(app).get('/api/v1/users').set('Authorization', 'Bearer palsu');
    expect(res.status).toBe(401);
  });
});
