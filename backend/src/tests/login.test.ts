import fs from 'fs';
import supertest from 'supertest';
import app from '../app';
import dbQuery from '../model/db-query';

const api = supertest(app);

const reset = fs.readFileSync('./src/model/reset.sql', 'utf-8');
const seed = fs.readFileSync('./src/model/seed.sql', 'utf-8');

beforeAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);

  const newUser = {
    username: 'test user',
    password: '12345',
    email: 'test@userRouter.com',
    knownLanguageId: 'de',
    learnLanguageId: 'en',
  };

  await api.post('/api/users').send(newUser);
});

describe('Testing user login', () => {
  test('users can login', async () => {
    const loginDetails = {
      password: '12345',
      email: 'test@userRouter.com',
    };

    const response = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toContain('token');
  });

  test('users cant login if email is incorrect', async () => {
    const loginDetails = {
      password: '12345',
      email: 'wrong@email.com',
    };

    const response = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(401)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toContain('invalid email or password');
  });

  test('users cant login if password is incorrect', async () => {
    const loginDetails = {
      password: 'wrong',
      email: 'test@userRouter.com',
    };

    const response = await api
      .post('/api/login')
      .send(loginDetails)
      .expect(401)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toContain('invalid email or password');
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
