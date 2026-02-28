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
});

describe('Testing adding users', () => {
  let token = '';

  test('users are successfully added', async () => {
    const newUser = {
      username: 'test user',
      password: '12345',
      email: 'test@userRouter.com',
      knownLanguageId: 'de',
      learnLanguageId: 'fr',
    };

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toContain('test user');
    expect(response.text).toContain('fr');

    const loginDetails = {
      password: '12345',
      email: 'test@userRouter.com',
    };

    const loginResponse = await api.post('/api/login').send(loginDetails);
    token = loginResponse.body.token;
  });

  test('duplicate emails are not added', async () => {
    const newUser = {
      username: 'test user1',
      password: '12345',
      email: 'test@userRouter.com',
      knownLanguageId: 'de',
      learnLanguageId: 'fr',
    };

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(406)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toContain('Email already in use');
  });

  test('users can change passwords', async () => {
    const password = {
      currentPassword: '12345',
      newPassword: 'password',
    };

    await api
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send(password)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect('{"message":"Your password has been updated"}');
  });

  test('users cant change passwords unless correct password is supplied', async () => {
    const password = {
      currentPassword: '123456',
      newPassword: 'password',
    };

    const response = await api
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send(password)
      .expect(406)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toContain('Incorrect password');
  });

  test('users are successfully deleted', async () => {
    await api
      .delete('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
