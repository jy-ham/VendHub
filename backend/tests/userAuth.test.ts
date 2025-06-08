import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userAuth } from '../api/userAuth.js';
import argon2 from 'argon2';
import { db } from '../api/dbConnection.js';
import { sign } from 'hono/jwt';

// Mocking db connection
vi.mock('../api/dbConnection', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
}));

// Mocking argon2
vi.mock('argon2', () => ({
  default: {
    hash: vi.fn(),
    verify: vi.fn()
  }
}));

// Mocking jwt
vi.mock('hono/jwt', () => ({
  __esModule: true,
  sign: vi.fn(() => 'mocked-token')
}));

const mockDb = db as unknown as {
  insert: any;
  values: any;
  select: any;
  from: any;
  where: any;
  limit: any;
};

const mockArgon2 = argon2 as unknown as {
  hash: any;
  verify: any;
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('POST /register', () => {
  it('returns 400 when email or password is missing', async () => {
    const req = new Request('https://test/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'test', email: '' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await userAuth.request(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Missing fields');
  });

  it('returns 200 when registration succeeds', async () => {
    mockArgon2.hash.mockResolvedValue('hashed_password');

    const req = new Request('https://test/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'test', email: 'test@test.com', password: 'pass' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await userAuth.request(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe('User registered');
  });
});

describe('POST /login', () => {
  it('returns 400 when fields are missing', async () => {
    const req = new Request('https://test/login', {
      method: 'POST',
      body: JSON.stringify({ email: '' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await userAuth.request(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Missing fields');
  });

  it('returns 404 when user is not found', async () => {
    mockDb.limit.mockResolvedValue([]);

    const req = new Request('https://test/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'missing@test.com', password: '1234' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await userAuth.request(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('User not found');
  });

  it('returns 401 if password is invalid', async () => {
    mockDb.limit.mockResolvedValue([{ password: 'hashed' }]);
    mockArgon2.verify.mockResolvedValue(false);

    const req = new Request('https://test/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await userAuth.request(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Invalid password');
  });

  it('returns 200 and sets a cookie if login is successful', async () => {
    mockDb.limit.mockResolvedValue([{ id: 1, email: 'test@test.com', password: 'hashed', username: 'test' }]);
    mockArgon2.verify.mockResolvedValue(true);

    // Mock sign to return fake token
    vi.mocked(sign);

    const req = new Request('https://test/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'pass' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await userAuth.request(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe('Login successful');
    expect(res.headers.get('Set-Cookie')).toContain('auth=mocked-token');
  });
});
