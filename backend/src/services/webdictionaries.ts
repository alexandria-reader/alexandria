import { QueryResult } from 'pg';
import webdictionaryData from '../data-access/webdictionaries';
import {
  WebdictionaryDB,
  Webdictionary,
  convertWebdictionaryTypes,
} from '../types';

const getBySourceTarget = async function (
  sourceLanguageId: string,
  targetLanguageId: string
): Promise<Array<Webdictionary>> {
  const result: QueryResult = await webdictionaryData.getBySourceTarget(
    sourceLanguageId,
    targetLanguageId
  );

  if (result.rowCount === 0) {
    const alternativeResult: QueryResult = await webdictionaryData.getBySource(
      sourceLanguageId
    );

    return alternativeResult.rows.map((dbItem: WebdictionaryDB) =>
      convertWebdictionaryTypes(dbItem)
    );
  }

  return result.rows.map((dbItem: WebdictionaryDB) =>
    convertWebdictionaryTypes(dbItem)
  );
};

export default {
  getBySourceTarget,
};
