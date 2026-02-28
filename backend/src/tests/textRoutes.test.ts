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

beforeAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});

describe('Testing adding texts', () => {
  let token = '';

  beforeAll(async () => {
    const loginDetails = {
      password: 'password',
      email: 'eamon@example.com',
    };
    const response = await api.post('/api/login').send(loginDetails);
    token = response.body.token;
  });

  test('A text is added successfully', async () => {
    const text = {
      userId: 1,
      languageId: 'en',
      title: 'The Little Match Girl',
      body: 'It was so terribly cold.',
    };

    const response = await api
      .post('/api/texts')
      .set('Authorization', `Bearer ${token}`)
      .send(text)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toMatch(/The Little Match Girl/);
  });

  test('Texts can be fetched by language with pagination', async () => {
    const response = await api
      .get('/api/texts/language/en/1/')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.currentPage).toBe(1);
    expect(response.body.totalTexts).toBe(2);
    expect(response.body.totalPages).toBe(1);
    expect(response.body.data).toHaveLength(2);
  });

  test('Texts can be found by id and include pageStartWordIndex', async () => {
    const response = await api
      .get('/api/texts/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toMatch(/The Little Match Girl/);
    expect(typeof response.body.pageStartWordIndex).toBe('number');
  });

  test('PUT /api/texts/:id/progress saves and returns progress', async () => {
    const response = await api
      .put('/api/texts/1/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ pageStartWordIndex: 100 })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.pageStartWordIndex).toBe(100);
    expect(response.body.textId).toBe(1);
  });

  test('PUT /api/texts/:id/progress rejects negative index', async () => {
    await api
      .put('/api/texts/1/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ pageStartWordIndex: -1 })
      .expect(400);
  });

  test('Texts can be updated', async () => {
    const text = {
      userId: 1,
      languageId: 'en',
      title: 'The Little Match Boy',
      body: 'It was so terribly cold.',
    };

    const response = await api
      .put('/api/texts/1')
      .set('Authorization', `Bearer ${token}`)
      .send(text)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.text).toMatch(/The Little Match Boy/);
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
