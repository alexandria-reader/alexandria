jest.mock('../../model/db-query');
jest.mock('../../services/login');
jest.mock('../../services/users');
jest.mock('../../services/texts');
jest.mock('../../services/words');
jest.mock('../../services/translations');
jest.mock('../../services/reading-progress');
jest.mock('../../services/languages');
jest.mock('../../services/webdictionaries');
jest.mock('../../utils/sendmail');
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({})),
}));

import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import env from '../../lib/env';
import type { SanitizedUser } from '@alexandria/shared';
import users from '../../services/users';

const api = supertest(app);

const mockedUsers = jest.mocked(users);

const validToken = jwt.sign({ id: 1 }, env.SECRET);
const authHeader = `Bearer ${validToken}`;

const mockUser: SanitizedUser = {
  id: 1,
  username: 'testuser',
  email: 'test@test.com',
  knownLanguageId: 'en',
  learnLanguageId: 'de',
  verified: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedUsers.getById.mockResolvedValue(mockUser);
});

describe('POST /api/login — validation', () => {
  it('rejects missing email', async () => {
    const res = await api.post('/api/login').send({ password: 'secret' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/required|expected/i);
  });

  it('rejects missing password', async () => {
    const res = await api.post('/api/login').send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/required|expected/i);
  });

  it('rejects empty body', async () => {
    const res = await api.post('/api/login').send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/users — validation', () => {
  it('rejects missing required fields', async () => {
    const res = await api
      .post('/api/users')
      .send({ username: 'test', password: '12345' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/required|expected/i);
  });

  it('rejects empty body', async () => {
    const res = await api.post('/api/users').send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/url — validation', () => {
  it('rejects missing url field', async () => {
    const res = await api
      .post('/api/url')
      .set('Authorization', authHeader)
      .send({});

    expect(res.status).toBe(400);
  });

  it('rejects invalid url', async () => {
    const res = await api
      .post('/api/url')
      .set('Authorization', authHeader)
      .send({ url: 'not-a-url' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/invalid|url/i);
  });
});

describe('PUT /api/words/:id — param validation', () => {
  it('rejects non-numeric id', async () => {
    const res = await api
      .put('/api/words/abc')
      .set('Authorization', authHeader)
      .send({ status: 'learning' });

    expect(res.status).toBe(400);
  });

  it('rejects negative id', async () => {
    const res = await api
      .put('/api/words/-1')
      .set('Authorization', authHeader)
      .send({ status: 'learning' });

    expect(res.status).toBe(400);
  });

  it('rejects invalid status value', async () => {
    const res = await api
      .put('/api/words/1')
      .set('Authorization', authHeader)
      .send({ status: 'bogus' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/translations/:id — validation', () => {
  it('rejects missing translation in body', async () => {
    const res = await api
      .put('/api/translations/1')
      .set('Authorization', authHeader)
      .send({});

    expect(res.status).toBe(400);
  });

  it('rejects non-numeric id param', async () => {
    const res = await api
      .put('/api/translations/abc')
      .set('Authorization', authHeader)
      .send({ translation: 'hello' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/translations — validation', () => {
  it('rejects missing required fields', async () => {
    const res = await api
      .post('/api/translations')
      .set('Authorization', authHeader)
      .send({ translation: 'hello' });

    expect(res.status).toBe(400);
  });

  it('rejects non-numeric wordId', async () => {
    const res = await api
      .post('/api/translations')
      .set('Authorization', authHeader)
      .send({
        wordId: 'abc',
        translation: 'hello',
        targetLanguageId: 'en',
      });

    expect(res.status).toBe(400);
  });
});
