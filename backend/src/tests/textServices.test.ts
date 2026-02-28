import fs from 'fs';
import path from 'path';
import dbQuery from '../model/db-query';
import texts from '../services/texts';
import { Text } from '@alexandria/shared';

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

describe('Getting texts', () => {
  test('getAll: get all 3 words from test database', async () => {
    const allTexts = await texts.getAll();
    expect(allTexts).toHaveLength(2);
  });

  test('getById: get word with id 2', async () => {
    const textById = await texts.getById(2, 2);
    expect(textById?.title).toBe(
      'Dans la « bibliothèque » de l\u2019artiste zimbabwéen Kudzanai Chiurai'
    );
  });

  test('getById: returns pageStartWordIndex from seeded reading_progress', async () => {
    const textById = await texts.getById(1, 1);
    expect(textById.pageStartWordIndex).toBe(42);
  });

  test('getById: returns pageStartWordIndex 0 when no progress exists', async () => {
    const textById = await texts.getById(2, 2);
    expect(textById.pageStartWordIndex).toBe(0);
  });

  // test('getById: get text with non-existent id 999 returns null', () => {
  //   async function getNonExisting() {
  //     await texts.getById(999);
  //   }

  //   expect(getNonExisting).toThrow();
  // });

  test('addNew: add a new text for user 2', async () => {
    const textData: Text = {
      userId: 2,
      languageId: 'de',
      title: 'Die Kuchengabel',
      author: 'Marc',
      body: 'Ich kann Käsekuchen nicht ohne Kuchengabel essen.',
    };

    const newText = await texts.addNew(textData);
    if (newText) expect(newText.title).toBe('Die Kuchengabel');
    expect(await texts.getAll()).toHaveLength(3);
  });

  test('getByUser: gets all texts for user 2', async () => {
    const result = await texts.getByUserAndLanguage(2, 'de', '1');
    expect(result.currentPage).toBe(1);
    expect(result.totalTexts).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Die Kuchengabel');
  });

  test('getByUser: page 2 returns empty when all texts fit on page 1', async () => {
    const result = await texts.getByUserAndLanguage(2, 'de', '2');
    expect(result.currentPage).toBe(2);
    expect(result.data).toHaveLength(0);
  });

  test('update: resets reading progress', async () => {
    const textById = await texts.getById(1, 1);
    expect(textById.pageStartWordIndex).toBe(42);

    await texts.update({
      id: 1,
      userId: 1,
      languageId: 'en',
      title: textById.title,
      body: textById.body,
    });

    const textAfterUpdate = await texts.getById(1, 1);
    expect(textAfterUpdate.pageStartWordIndex).toBe(0);
  });

  test('remove: removing an existing text', async () => {
    const existingText = await texts.getById(3, 2);

    if (existingText?.id) {
      const removedText = await texts.remove(existingText.id);
      expect(removedText?.title).toBe('Die Kuchengabel');
      expect(await texts.getAll()).toHaveLength(2);
    }
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
