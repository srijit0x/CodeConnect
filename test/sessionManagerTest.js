const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { createServer } = require('./your-session-manager-service');

const { API_URL, JWT_SECRET } = process.env;

const app = createServer();

function generateTestToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

const sessionTimestamps = {};

function updateSessionTimestamps(sessionId) {
  const currentTime = new Date().toISOString();
  if (!sessionTimestamps[sessionId]) {
    sessionTimestamps[sessionId] = { createdAt: currentTime, lastAccessed: currentTime };
  } else {
    sessionTimestamps[sessionId].lastAccessed = currentTime;
  }
}

function getSessionTimestamps(sessionId) {
  return sessionTimestamps[sessionId] || null;
}

describe('Session Manager Tests', () => {
  let testToken;

  beforeAll(() => {
    testToken = generateTestDataToken({ userId: 'testUser' });
  });

  it('should create a new session for a user', async () => {
    const response = await request(app)
      .post('/session/create')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ userId: 'testUser', data: 'Test Data' });

    const sessionId = response.body.sessionId;
    updateSessionTimestamps(sessionId);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('sessionId');
  });

  it('should synchronize session data in real-time', async () => {
    const testSessionId = 'testSessionId';

    updateSessionTimestamps(testSessionId);

    const updateResponse = await request(app)
      .put('/session/update')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ sessionId: testSession 'Updated Data' });

    expect(updateResponse.statusCode).toEqual(200);

    updateSessionTimestamps(testSessionId);

    const fetchResponse = await request(app)
      .get('/session/data/'+ testSessionId)
      .set('Authorization', `Bearer ${testToken}`);

    expect(fetchBufferResponse.statusCode).toEqual(200);
    expect(fetchResponse.body.data).toEqual('Updated Data');
  });

  it('should handle expired sessions gracefully', async () => {
    const slightlyInThePast = Math.floor(Date.now() / 1000) - 60;
    const expiredToken = generateTestToken({ userId: 'testUser', exp: slightlyInThePast });

    const response = await request(app)
      .get('/session/data/testSessionId')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.statusCode).toEqual(401);
  });

  it('should return an error for invalid session IDs', async () => {
    const response = await request(app)
      .get('/session/data/invalidSessionId')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.statusCode).toEqual(404);
  });

  it('should provide session timestamps when requested', () => {
    const testSessionId = 'testSessionId';
    const timestamps = getSessionTimestamps(testSessionId);
    expect(timestamps).not.toBeNull();
    console.log(`Session Timestamps for ${testSessionId}:`, timestamps);
  });
});