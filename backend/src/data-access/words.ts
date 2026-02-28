/* eslint-disable max-len */
import { QueryResult } from 'pg';
import dbQuery from '../model/db-query';
import { Word } from '../types';
import languages from './languages';

// Returning all words in the database is only needed in tests
const getAll = async function (): Promise<QueryResult> {
  const ALL_WORDS: string = `
    SELECT * FROM words`;

  const result = await dbQuery(ALL_WORDS);

  return result;
};

const getWordInLanguage = async function (
  word: string,
  languageId: string
): Promise<QueryResult> {
  const WORD_BY_LANGUAGE_AND_WORD: string = `
    SELECT * FROM words 
     WHERE language_id = %L 
           AND 
           word = %L`;

  const result = await dbQuery(WORD_BY_LANGUAGE_AND_WORD, languageId, word);

  return result;
};

// Finds all words in a text that a user has previously marked and returns translations and contexts as well
const getUserwordsInText = async function (
  userId: number,
  textId: number,
  targetLanguageId: string,
  simple: boolean = true
): Promise<QueryResult> {
  const tsvectorType = simple ? 'simple' : 'language';

  const USER_WORDS_IN_TEXT: string = `
      SELECT DISTINCT w.id AS word_id, 
                      w.word, 
                      array_agg(t.id) AS translation_ids,
                      array_agg(t.translation) AS translation_texts,
                      array_agg(ut.context) AS translation_contexts, 
                      uw.word_status AS status
        FROM words AS w 
        JOIN translations AS t ON w.id = t.word_id 
        JOIN users_translations AS ut ON t.id = ut.translation_id 
        JOIN users_words AS uw ON w.id = uw.word_id 
       WHERE uw.user_id = %s 
             AND 
             ut.user_id = %s 
             AND
             t.target_language_id = %L 
             AND
             w.language_id = (SELECT t.language_id FROM texts AS t 
                               WHERE t.id = %s)
             AND
             w.tsquery_${tsvectorType} @@ (SELECT t.tsvector_${tsvectorType} FROM texts AS t 
                                            WHERE t.id = %s)        
    GROUP BY w.id, w.word, uw.word_status`;

  const result = await dbQuery(
    USER_WORDS_IN_TEXT,
    userId,
    userId,
    targetLanguageId,
    textId,
    textId
  );

  return result;
};

// Finds all words a user has marked in a given language and returns translations and contexts as well
const getUserwordsByLanguage = async function (
  languageId: string,
  userId: number,
  simple: boolean = true
): Promise<QueryResult> {
  let tsvectorType = 'simple';
  let tsConfig = 'simple';

  if (!simple) {
    tsvectorType = 'language';
    const result = await languages.getById(languageId);
    tsConfig = result.rows[0].name;
  }

  const WORDS_BY_LANGUAGE_AND_USER: string = `
      SELECT DISTINCT w.id AS word_id, 
                      w.word, 
                      array_agg(t.id) AS translation_ids,
                      array_agg(t.target_language_id) AS language_ids,
                      array_agg(t.translation) AS translation_texts, 
                      array_agg(ts_headline('${tsConfig}', 
                                            ut.context, 
                                            w.tsquery_${tsvectorType}, 
                                            'StartSel=<strong>, StopSel=</strong> MaxWords=35, MinWords=20')) AS translation_contexts, 
                      uw.word_status AS status
        FROM words AS w 
        JOIN translations AS t ON w.id = t.word_id 
        JOIN users_translations AS ut ON t.id = ut.translation_id 
        JOIN users_words AS uw ON w.id = uw.word_id 
       WHERE uw.user_id = %s 
             AND 
             ut.user_id = %s 
             AND
             w.language_id = %L 
    GROUP BY w.id, w.word, uw.word_status
    ORDER BY w.word ASC`;

  const result = await dbQuery(
    WORDS_BY_LANGUAGE_AND_USER,
    userId,
    userId,
    languageId
  );

  return result;
};

const addNew = async function (wordObject: Word): Promise<QueryResult> {
  const { languageId, word } = wordObject;

  const existingWord = await getWordInLanguage(word, languageId);
  if (existingWord.rowCount > 0) {
    return existingWord;
  }

  const ADD_WORD: string = `
    INSERT INTO words (language_id, word, ts_config)
         VALUES (%L, %L, (SELECT "name" FROM languages AS l WHERE l.id = %L)::regconfig)
      RETURNING *`;

  const result = await dbQuery(ADD_WORD, languageId, word, languageId);

  return result;
};

// Retrieves word status string for given user
const getStatus = async function (
  wordId: number,
  userId: number
): Promise<QueryResult> {
  const USER_WORD_STATUS: string = `
    SELECT word_status FROM users_words 
     WHERE user_id = %s 
           AND
           word_id = %s`;

  const result = await dbQuery(USER_WORD_STATUS, userId, wordId);

  return result;
};

const addStatus = async function (
  wordId: number,
  userId: number,
  wordStatus: string
): Promise<QueryResult> {
  const existingStatus = await getStatus(wordId, userId);

  if (existingStatus.rowCount > 0) {
    return existingStatus;
  }

  const ADD_USER_WORD_STATUS: string = `
    INSERT INTO users_words (user_id, word_id, word_status)
         VALUES (%s, %s, %L)
      RETURNING *`;

  const result = await dbQuery(
    ADD_USER_WORD_STATUS,
    userId,
    wordId,
    wordStatus
  );

  return result;
};

const updateStatus = async function (
  wordId: number,
  userId: number,
  wordStatus: string
): Promise<QueryResult> {
  const UPDATE_USER_WORD_STATUS: string = `
       UPDATE users_words 
          SET word_status = %L 
        WHERE user_id = %L 
              AND
              word_id = %L
    RETURNING *`;

  const result = await dbQuery(
    UPDATE_USER_WORD_STATUS,
    wordStatus,
    userId,
    wordId
  );

  return result;
};

const removeUserWord = async function (
  wordId: number,
  userId: number
): Promise<QueryResult> {
  const REMOVE_USER_WORD: string = `
    DELETE FROM users_words 
          WHERE user_id = %s 
            AND word_id = %s
    RETURNING *`;

  const result = await dbQuery(REMOVE_USER_WORD, userId, wordId);

  return result;
};

const remove = async function (wordId: number): Promise<QueryResult> {
  const DELETE_WORD: string = `
       DELETE FROM words
        WHERE id = %s
    RETURNING *`;

  const result = await dbQuery(DELETE_WORD, wordId);

  return result;
};

export default {
  getAll,
  getUserwordsByLanguage,
  getUserwordsInText,
  getWordInLanguage,
  addNew,
  getStatus,
  addStatus,
  updateStatus,
  removeUserWord,
  remove,
};
