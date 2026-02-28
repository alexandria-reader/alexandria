import fs from 'fs';
import dbQuery from '../model/db-query';
import words from '../services/words';
import { Word } from '../types';

const reset = fs.readFileSync('./src/model/reset.sql', 'utf-8');
const seed = fs.readFileSync('./src/model/seed.sql', 'utf-8');

beforeAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});

describe('Getting words', () => {
  test('getAll: get all 10 words from test database', async () => {
    const allWords = await words.getAll();
    expect(allWords).toHaveLength(10);
  });

  test('getByUser: find all words that user 1 marked in text 1', async () => {
    const userWords = await words.getUserwordsInText(1, 1, 'de');
    expect(userWords).toHaveLength(3);
  });

  test('addNew: add a new word', async () => {
    const wordData: Word = {
      languageId: 'de',
      word: 'Kuchengabel',
    };

    const newWord = await words.addNew(wordData);
    if (newWord) expect(newWord.word).toContain('Kuchengabel');
    expect(await words.getAll()).toHaveLength(11);
  });

  test('addNew: add a word that already exists in the language', async () => {
    const existingWord = await words.getWordInLanguage('Kuchengabel', 'de');

    const wordData: Word = {
      languageId: 'de',
      word: 'Kuchengabel',
    };

    const newWord = await words.addNew(wordData);
    if (newWord) expect(newWord.word).toContain('Kuchengabel');
    if (newWord) expect(newWord.id).toEqual(existingWord?.id);
    expect(await words.getAll()).toHaveLength(11);
  });

  test('remove: removing an existing word', async () => {
    const existingWord = await words.getWordInLanguage('Kuchengabel', 'de');

    if (existingWord?.id) {
      const removedWord = await words.remove(existingWord.id);
      expect(removedWord?.word).toContain('Kuchengabel');
      expect(await words.getAll()).toHaveLength(10);
    }
  });

  test('getStatus: status of word 5 for user 1', async () => {
    const status = await words.getStatus(5, 1);
    expect(status).toBe('learned');
  });

  test('updateStatus: change previous status to "familiar"', async () => {
    const updatedStatus = await words.updateStatus(5, 1, 'familiar');
    expect(updatedStatus).toBe('familiar');

    const status = await words.getStatus(5, 1);
    expect(status).toBe('familiar');
  });

  test('addStatus: add status "familiar" to word 4 for user 1', async () => {
    const addedStatus = await words.addStatus(4, 1, 'familiar');
    expect(addedStatus).toBe('familiar');

    const status = await words.getStatus(4, 1);
    expect(status).toBe('familiar');
  });
});

afterAll(async () => {
  await dbQuery(reset);
  await dbQuery(seed);
});
