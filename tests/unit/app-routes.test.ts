import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/server.js';

describe('portfolio routes', () => {
  it('serves the landing page', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Security Software Engineer');
  });

  it('rejects invalid contact payloads', async () => {
    const response = await request(app)
      .post('/api/contact')
      .type('form')
      .send({ name: 'A', email: 'bad', message: '' });

    expect(response.status).toBe(400);
  });
});
