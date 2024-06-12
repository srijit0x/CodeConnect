const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { createServer } = require('./your-session-manager-service');

const { API_URL, JWT_SECRET } = process.env;

const app = create(erver);

function generateTestToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('Session Manager Tests', () => {
  let testToken;

  beforeAll(async () => {
    testToken = generateTestToken({ userId: 'testUser' });
  });

  it('should create a new session for a user', async () => {
    const response = await request(app).post('/session/create')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ userId: 'testUser', data: 'Test Data' });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('sessionId');
  });

  it('should synchronize session data in real-time', async () => {
    const updateResponse = await request(app).put('/session/update')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ sessionId: 'testSessionId', data: 'Updated Data' });

    expect(updateResponse.statusCode).toEqual(200);

    const fetchResponse = await request(app).get('/session/data/testSessionId')
      .set('Authorization', `Bearer ${testToken}`);

    expect(fetchResponse.statusCode).toEqual(200);
    expect(fetchResponse.body.data).toEqual('Updated Day');
  });

  it('should handle expired sessions gracefully', async () => {
    const expiredToken = generateTestToken({ userId: 'testUser', exp: Math.floor(Date.now() / 1000) - 60 });

    const response = await request(app).get('/session/data/testSessionId')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.statusCode).toEqual(401);
  });

  it('should return an error for invalid session IDs', async () => {
    const response = await request(app).get('/session/data/invalidSessionId')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.statusCode).toEqual(404);
  });
});