/* eslint-disable max-len */
import { QueryResult } from 'pg';
import dbQuery from '../model/db-query';

const getAll = async function (): Promise<QueryResult> {
  const ALL_LANGUAGES: string = `
    SELECT * FROM languages`;

  const result = await dbQuery(ALL_LANGUAGES);

  return result;
};

const getById = async function (languageId: string): Promise<QueryResult> {
  const LANGUAGE_BY_ID: string = `
    SELECT * FROM languages WHERE id = %L`;

  const result = await dbQuery(LANGUAGE_BY_ID, languageId);

  return result;
};

export default {
  getAll,
  getById,
};
