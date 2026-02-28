import fs from 'fs';
import dbQuery from '../model/db-query';
import languages from '../services/languages';

const reset = fs.readFileSync('./src/model/reset.sql', 'utf-8');
const seed = fs.readFileSync('./src/model/seed.sql', 'utf-8');

beforeAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});

describe('Getting languages', () => {
  test('getAll: get all 15 languages from test database', async () => {
    const allTexts = await languages.getAll();
    expect(allTexts).toHaveLength(10);
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
