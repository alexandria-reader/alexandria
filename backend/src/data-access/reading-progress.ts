import { QueryResult } from 'pg';
import dbQuery from '../model/db-query';

const upsert = async function (
  userId: number,
  textId: number,
  pageStartWordIndex: number
): Promise<QueryResult> {
  const UPSERT_PROGRESS: string = `
    INSERT INTO reading_progress (user_id, text_id, page_start_word_index)
         VALUES (%s, %s, %s)
    ON CONFLICT (user_id, text_id)
      DO UPDATE SET page_start_word_index = %s,
                    updated_at = now()
      RETURNING *`;

  const result = await dbQuery(
    UPSERT_PROGRESS,
    userId,
    textId,
    pageStartWordIndex,
    pageStartWordIndex
  );

  return result;
};

const deleteByTextId = async function (textId: number): Promise<QueryResult> {
  const DELETE_PROGRESS: string = `
    DELETE FROM reading_progress
          WHERE text_id = %s`;

  const result = await dbQuery(DELETE_PROGRESS, textId);

  return result;
};

export default {
  upsert,
  deleteByTextId,
};
