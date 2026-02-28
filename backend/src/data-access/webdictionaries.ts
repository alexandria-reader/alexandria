/* eslint-disable max-len */
import { QueryResult } from 'pg';
import dbQuery from '../model/db-query';

const getBySource = async function getBySourceLanguage(
  sourceLanguageId: string
): Promise<QueryResult> {
  const DICTIONARIES_BY_SOURCE: string = `
    SELECT * FROM webdictionaries
     WHERE source_language_id = %L`;

  const result = await dbQuery(DICTIONARIES_BY_SOURCE, sourceLanguageId);

  return result;
};

const getBySourceTarget = async function getBySourceLanguage(
  sourceLanguageId: string,
  targetLanguageId: string
): Promise<QueryResult> {
  const DICTIONARIES_BY_SOURCE_TARGET: string = `
    SELECT * FROM webdictionaries
     WHERE source_language_id = %L
       AND target_language_id = %L`;

  const result = await dbQuery(
    DICTIONARIES_BY_SOURCE_TARGET,
    sourceLanguageId,
    targetLanguageId
  );

  return result;
};

export default {
  getBySource,
  getBySourceTarget,
};
