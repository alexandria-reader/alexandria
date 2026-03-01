import fs from 'fs';
import path from 'path';
import supertest from 'supertest';
import app from '../app';
import dbQuery from '../model/db-query';

const api = supertest(app);

const reset = fs.readFileSync(
  path.join(__dirname, '../model/reset.sql'),
  'utf-8'
);
const seed = fs.readFileSync(
  path.join(__dirname, '../model/seed.sql'),
  'utf-8'
);
let token = '';

beforeAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);

  const loginDetails = {
    password: 'password',
    email: 'eamon@example.com',
  };

  const loginResponse = await api.post('/api/login').send(loginDetails);
  token = loginResponse.body.token;
});

describe('Test word routes', () => {
  test('retrieve all words in a text by language', async () => {
    await api
      .get('/api/words/text/1/language/de')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect((response) => {
        expect(response.body.length).toEqual(4);
      });
  });

  test('retrieve word by language', async () => {
    await api
      .get('/api/words/language/en')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect((res) => {
        expect(res.body[0].word).toEqual('across the road');
      });
  });
});

describe('Testing adding a word', () => {
  test('add a new word', async () => {
    const word = {
      languageId: 'en',
      word: 'hellotest',
      translations: [],
    };

    await api
      .post('/api/words')
      .set('Authorization', `Bearer ${token}`)
      .send(word)
      .expect(201);
  });

  test('modify an existing word', async () => {
    const data = { status: 'familiar' };
    await api
      .put('/api/words/1')
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(200)
      .expect('familiar');
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
