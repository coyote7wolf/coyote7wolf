'use strict';
const request = require('supertest');
const { createApp } = require('../../../../src/app');
const { buildContainer } = require('../../../../src/container');

describe('UserController (routes)', () => {
  let app;
  beforeEach(() => {
    const container = buildContainer();
    app = createApp({ container });
  });

  test('POST /api/v1/users & GET', async () => {
    const createRes = await request(app)
      .post('/api/v1/users')
      .send({ name: 'Tester', email: 'tester@example.com' })
      .expect(201);
    const id = createRes.body.data.id;
    const getRes = await request(app).get(`/api/v1/users/${id}`).expect(200);
    expect(getRes.body.data.email).toBe('tester@example.com');
  });
});
