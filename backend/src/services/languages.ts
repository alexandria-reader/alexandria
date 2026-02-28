import boom from '@hapi/boom';
import { QueryResult } from 'pg';
import languageData from '../data-access/languages';
import { convertLanguageTypes, Language, LanguageDB } from '../types';

const getAll = async function (): Promise<Array<Language>> {
  const result: QueryResult = await languageData.getAll();
  if (result.rowCount === 0) throw boom.notFound('No languages available.');
  return result.rows.map((dbItem: LanguageDB) => convertLanguageTypes(dbItem));
};

export default {
  getAll,
};
