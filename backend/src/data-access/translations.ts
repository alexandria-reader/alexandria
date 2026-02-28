import dbQuery from '../model/db-query';

const getAll = async function () {
  const FIND_TRANSLATIONS = 'SELECT * FROM translations';
  const results = await dbQuery(FIND_TRANSLATIONS);
  return results;
};

const add = async function (
  wordId: number,
  translation: string,
  targetLang: string
) {
  const INSERT_TRANSLATION =
    'INSERT INTO translations (word_id, translation, target_language_id) VALUES (%L, %L, %L) RETURNING *';
  const results = await dbQuery(
    INSERT_TRANSLATION,
    wordId,
    translation,
    targetLang
  );
  return results;
};

const update = async function (translationId: number, translation: string) {
  const UPDATE_TRANSLATION =
    'UPDATE translations SET translation = %L WHERE id = %L RETURNING translations.*';
  const result = await dbQuery(UPDATE_TRANSLATION, translation, translationId);
  return result;
};

const getUserTranslationContext = async function (
  userId: number,
  translationId: number
) {
  const USER_TRANSLATION =
    'SELECT context FROM users_translations WHERE user_id = %s AND translation_id = %s';
  const result = await dbQuery(USER_TRANSLATION, userId, translationId);
  return result;
};

const remove = async function (translationId: number) {
  const REMOVE_USERS_TRANSLATIONS =
    'DELETE FROM users_translations WHERE translation_id = %L RETURNING *';
  const result = await dbQuery(REMOVE_USERS_TRANSLATIONS, translationId);
  return result;
};

const addToUsersTranslations = async function (
  userId: number,
  translationId: number,
  context: string | undefined
) {
  const USER_TRANSLATION =
    'INSERT INTO users_translations (user_id, translation_id, context) VALUES(%L, %L, %L) RETURNING *';
  const result = await dbQuery(
    USER_TRANSLATION,
    userId,
    translationId,
    context
  );
  return result;
};

export default {
  getAll,
  add,
  addToUsersTranslations,
  update,
  remove,
  getUserTranslationContext,
};
