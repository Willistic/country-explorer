import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

const validUser = {
  email: 'alice@example.com',
  password: 'Sup3rSecret!',
  firstName: 'Alice',
  lastName: 'Smith'
};

const registerUser = (overrides: Record<string, unknown> = {}) =>
  request(app)
    .post('/api/v1/auth/register')
    .send({ ...validUser, ...overrides });

describe('POST /api/v1/auth/register', () => {
  it('registers a new user and returns a token without exposing the password', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(res.body.data.tokens.accessToken).toEqual(expect.any(String));
  });

  it('rejects a duplicate email with 409', async () => {
    await registerUser();
    const res = await registerUser();

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects a weak password with 400', async () => {
    const res = await registerUser({ email: 'weak@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects an invalid email with 400', async () => {
    const res = await registerUser({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await registerUser();

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toEqual(expect.any(String));
  });

  it('rejects a wrong password with 401', async () => {
    await registerUser();

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects an unknown user with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/auth/profile (protected)', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });

  it('returns the profile with a valid token', async () => {
    const registered = await registerUser();
    const token = registered.body.data.tokens.accessToken;

    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(validUser.email);
  });
});
