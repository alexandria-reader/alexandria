import fs from 'fs';
import supertest from 'supertest';
import app from '../app';
import dbQuery from '../model/db-query';

const api = supertest(app);

const reset = fs.readFileSync('./src/model/reset.sql', 'utf-8');
const seed = fs.readFileSync('./src/model/seed.sql', 'utf-8');
let token = '';

describe('Testing adding translations', () => {
  beforeAll(async () => {
    await dbQuery(reset);
    await dbQuery(seed);

    const loginDetails = {
      password: 'password',
      email: 'eamon@example.com',
    };
    const response = await api.post('/api/login').send(loginDetails);
    token = response.body.token;
  });

  test('new translation is correctly added', async () => {
    await dbQuery('SELECT * FROM languages');
    const ADD_WORD =
      'INSERT INTO words (language_id, word, ts_config) VALUES(%L, %L, %L) RETURNING *';
    const LAST_ADD_WORD = await dbQuery(ADD_WORD, 'en', 'hello', 'english');
    await dbQuery('SELECT * FROM words WHERE id=11');
    const LAST_ID = Number(LAST_ADD_WORD.rows[0].id);
    const newTranslation = {
      wordId: LAST_ID,
      translation: 'allo',
      targetLanguageId: 'fr',
    };
    await api
      .post('/api/translations')
      .set('Authorization', `Bearer ${token}`)
      .send(newTranslation)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8');
  });

  test('update translation with specified id', async () => {
    const updatedTranslation = {
      translation: 'translation',
    };
    await api
      .put('/api/translations/23')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedTranslation)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8');
  });

  test('translation with specified id is deleted', async () => {
    await api
      .delete('/api/translations/23')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
