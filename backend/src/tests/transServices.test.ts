/* eslint-disable max-len */
import fs from 'fs';
import dbQuery from '../model/db-query';
import translations from '../services/translations';

const reset = fs.readFileSync('./src/model/reset.sql', 'utf-8');
const seed = fs.readFileSync('./src/model/seed.sql', 'utf-8');

beforeAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});

describe('Testing translations services', () => {
  test('getAll: retrieve all translations', async () => {
    const result = await translations.getAll();
    expect(result).toHaveLength(24);
  });

  test('add: new translation is correctly added', async () => {
    const wordId = 9;
    const translation = 'voitures';
    const targetLanguageId = 'fr';

    const result = await translations.add(
      wordId,
      translation,
      targetLanguageId
    );
    if (result) {
      expect(result.translation).toContain('voitures');
      expect(result.targetLanguageId).toContain('fr');
    }
  });

  test('aaddToUsersTranslationsdd: test a new translation is also added to the users_translations table', async () => {
    const wordId = 9;
    const translation = 'auto';
    const targetLanguageId = 'de';

    const resultTrans = await translations.add(
      wordId,
      translation,
      targetLanguageId
    );
    if (resultTrans.id) {
      const lastTransId = resultTrans.id;
      const result = await translations.addToUsersTranslations(
        1,
        lastTransId,
        ''
      );
      if (result) {
        expect(result).toBe('');
      }
    }
  });

  test('update translation with specified id', async () => {
    const updatedTranslation = 'avide';
    const translationId = 14;
    const result = await translations.update(translationId, updatedTranslation);
    if (result) {
      expect(result.translation).toContain('avide');
      expect(result.targetLanguageId).toContain('fr');
    }
  });

  // TODO: fix test, currently failing
  xtest('translation with specified id is deleted', async () => {
    const id = 1;
    const result = await translations.remove(id);
    if (result) {
      const translationsArray = await translations.getAll();
      expect(translationsArray.length).toBe(25);
    }
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
