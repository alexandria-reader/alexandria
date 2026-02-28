import boom from '@hapi/boom';
import { QueryResult } from 'pg';
import textData from '../data-access/texts';
import readingProgressData from '../data-access/reading-progress';
import { TextPagination, Text } from '@alexandria/shared';
import { convertTextTypes, TextDB } from '../types';
import { DEFAULT_OFFSET } from '../constants';

const getAll = async function (): Promise<Array<Text>> {
  const result: QueryResult = await textData.getAll();

  return result.rows.map((dbItem: TextDB) => convertTextTypes(dbItem));
};

const getById = async function (textId: number, userId: number): Promise<Text> {
  const result: QueryResult = await textData.getById(textId, userId);

  if (result.rowCount === 0)
    throw boom.notFound('Could not find text with this id.');

  const text = convertTextTypes(result.rows[0]);
  text.pageStartWordIndex = result.rows[0].page_start_word_index ?? 0;
  return text;
};

const getByUserAndLanguage = async function (
  userId: number,
  languageId: string,
  pageNumber: string
): Promise<TextPagination> {
  const result: QueryResult = await textData.getByUserAndLanguage(
    userId,
    languageId,
    Number(pageNumber) - 1
  );

  const totalTexts = Number(result.rows[0]?.totaltexts) || 0;
  const paginatedTexts: TextPagination = {
    currentPage: Number(pageNumber),
    totalPages: Math.ceil(totalTexts / DEFAULT_OFFSET),
    totalTexts,
    nextPage: Number(pageNumber) + 1,
    prevPage: Number(pageNumber) - 1,
    data: result.rows.map((dbItem: TextDB) => convertTextTypes(dbItem)),
  };
  return paginatedTexts;
};

const addNew = async function (textObject: Text): Promise<Text> {
  const result: QueryResult = await textData.addNew(textObject);
  if (result.rowCount === 0) throw boom.badRequest('Could not add new text.');
  return convertTextTypes(result.rows[0]);
};

const update = async function (textObject: Text): Promise<Text> {
  const result: QueryResult = await textData.update(textObject);
  if (result.rowCount === 0) throw boom.badRequest('Could not update text.');
  if (textObject.id) {
    await readingProgressData.deleteByTextId(textObject.id);
  }
  return convertTextTypes(result.rows[0]);
};

const remove = async function (textId: number): Promise<Text> {
  const result: QueryResult = await textData.remove(textId);
  if (result.rowCount === 0) throw boom.badRequest('Could not remove text.');
  return convertTextTypes(result.rows[0]);
};

export default {
  getAll,
  getById,
  getByUserAndLanguage,
  addNew,
  update,
  remove,
};
