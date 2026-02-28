import boom from '@hapi/boom';
import { QueryResult } from 'pg';
import translationData from '../data-access/translations';
import { TranslationDB, Translation, convertTranslationTypes } from '../types';

const getAll = async function () {
  const results = await translationData.getAll();
  return results.rows.map((dbItem: TranslationDB) =>
    convertTranslationTypes(dbItem)
  );
};

const add = async function (
  wordId: number,
  translation: string,
  targetLang: string
): Promise<Translation> {
  const result: QueryResult = await translationData.add(
    wordId,
    translation,
    targetLang
  );

  if (result.rowCount === 0)
    throw boom.notFound('Adding new translation not successful.');

  return convertTranslationTypes(result.rows[0]);
};

const update = async function (
  translationId: number,
  translation: string
): Promise<Translation> {
  const result: QueryResult = await translationData.update(
    translationId,
    translation
  );

  if (result.rowCount === 0)
    throw boom.notFound(
      'Updating translation with given translation id not successful.'
    );

  return convertTranslationTypes(result.rows[0]);
};

const getUserTranslationContext = async function (
  userId: number,
  translationId: number
): Promise<string> {
  const result: QueryResult = await translationData.getUserTranslationContext(
    userId,
    translationId
  );

  if (result.rowCount === 0)
    throw boom.notFound('No connection between user and translation');

  return result.rows[0] || '';
};

const remove = async function (translationId: number) {
  const result: QueryResult = await translationData.remove(translationId);

  if (result.rowCount === 0)
    throw boom.notFound('Removing translation not successful.');

  return convertTranslationTypes(result.rows[0]);
};

const addToUsersTranslations = async function (
  userId: number,
  translationId: number,
  context: string | undefined
): Promise<string> {
  const result: QueryResult = await translationData.addToUsersTranslations(
    userId,
    translationId,
    context
  );

  if (result.rowCount === 0)
    throw boom.notFound('Connecting user and translation not successful.');

  return result.rows[0].context;
};

export default {
  getAll,
  add,
  addToUsersTranslations,
  getUserTranslationContext,
  update,
  remove,
};
