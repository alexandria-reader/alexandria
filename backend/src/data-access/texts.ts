/* eslint-disable max-len */
import { QueryResult } from 'pg';
import dbQuery from '../model/db-query';
import { Text } from '@alexandria/shared';
import { DEFAULT_OFFSET } from '../constants';

const getAll = async function (): Promise<QueryResult> {
  const ALL_TEXTS: string = `
    SELECT * FROM texts`;

  const result = await dbQuery(ALL_TEXTS);

  return result;
};

const getById = async function (
  textId: number,
  userId: number
): Promise<QueryResult> {
  const TEXT_BY_ID: string = `
    SELECT t.*, rp.page_start_word_index
      FROM texts t
      LEFT JOIN reading_progress rp ON rp.text_id = t.id AND rp.user_id = %s
     WHERE t.id = %s`;

  const result = await dbQuery(TEXT_BY_ID, userId, textId);

  return result;
};

const getByUserAndLanguage = async function (
  userId: number,
  languageId: string,
  page: number
): Promise<QueryResult> {
  const TEXTS_BY_USER: string = `
    SELECT *, COUNT(*) OVER () as totalTexts 
    FROM texts
    WHERE user_id = %L AND language_id = %L
    ORDER BY upload_time DESC NULLS LAST
    OFFSET %L FETCH NEXT %L ROWS ONLY`;

  const result = await dbQuery(
    TEXTS_BY_USER,
    userId,
    languageId,
    DEFAULT_OFFSET * page,
    DEFAULT_OFFSET
  );

  return result;
};

const addNew = async function (textObject: Text): Promise<QueryResult> {
  const { userId, languageId, title, author, body, sourceURL, sourceType } =
    textObject;

  const ADD_TEXT: string = `
    INSERT INTO texts (user_id, language_id, title, author,
                       body, ts_config, source_url, source_type)
         VALUES (%s, %L, %L, %L, %L, 
                 (SELECT "name" FROM languages AS l WHERE l.id = %L)::regconfig, %L, %L)
      RETURNING *`;

  const result = await dbQuery(
    ADD_TEXT,
    userId,
    languageId,
    title,
    author || null,
    body,
    languageId,
    sourceURL || null,
    sourceType || null
  );

  return result;
};

const update = async function (textObject: Text): Promise<QueryResult> {
  const { id, userId, languageId, title, author, body, sourceURL, sourceType } =
    textObject;

  const ADD_TEXT: string = `
       UPDATE texts 
          SET user_id = %s, 
              language_id = %L, 
              title = %L, 
              author = %L, 
              body = %L, 
              source_url = %L, 
              source_type = %L
        WHERE id = %s 
    RETURNING *`;

  const result = await dbQuery(
    ADD_TEXT,
    userId,
    languageId,
    title,
    author || null,
    body,
    sourceURL || null,
    sourceType || null,
    id
  );

  return result;
};

const remove = async function (textId: number): Promise<QueryResult> {
  const REMOVE_TEXT: string = `
    DELETE FROM texts 
          WHERE id = %s
      RETURNING *`;

  const result = await dbQuery(REMOVE_TEXT, textId);

  return result;
};

const addMatchGirlToUser = async function (userId: number, languageId: string) {
  const ADD_MATCH_GIRL = `
    INSERT INTO texts (user_id, language_id, author, title, body, ts_config) 
         VALUES (%s, %L, 'Hans Christian Andersen', 
                  (SELECT title FROM match_girl WHERE language_id = %L), 
                  (SELECT body FROM match_girl WHERE language_id = %L), 
                  (SELECT "name" FROM languages AS l WHERE l.id = %L)::regconfig)
      RETURNING *`;

  const result = await dbQuery(
    ADD_MATCH_GIRL,
    userId,
    languageId,
    languageId,
    languageId,
    languageId
  );

  return result;
};

export default {
  getAll,
  getByUserAndLanguage,
  getById,
  addNew,
  update,
  remove,
  addMatchGirlToUser,
};
