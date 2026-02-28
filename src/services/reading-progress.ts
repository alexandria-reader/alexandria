import boom from '@hapi/boom';
import readingProgressData from '../data-access/reading-progress';
import {
  ReadingProgress,
  ReadingProgressDB,
  convertReadingProgressTypes,
} from '../types';

const save = async function (
  userId: number,
  textId: number,
  pageStartWordIndex: number
): Promise<ReadingProgress> {
  if (pageStartWordIndex < 0) {
    throw boom.badRequest('pageStartWordIndex must be >= 0');
  }

  const result = await readingProgressData.upsert(
    userId,
    textId,
    pageStartWordIndex
  );

  return convertReadingProgressTypes(result.rows[0] as ReadingProgressDB);
};

export default { save };
