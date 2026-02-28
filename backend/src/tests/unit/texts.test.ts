import texts from '../../services/texts';

jest.mock('../../data-access/texts');
jest.mock('../../data-access/reading-progress');

import textData from '../../data-access/texts';
import readingProgressData from '../../data-access/reading-progress';

const mockedTextData = jest.mocked(textData);
const mockedReadingProgressData = jest.mocked(readingProgressData);

const fakeTextDB = {
  id: 1,
  user_id: 1,
  language_id: '1',
  title: 'Test Text',
  author: null,
  body: 'Hello world',
  source_url: null,
  source_type: null,
  upload_time: '2024-01-01',
  is_public: false,
};

describe('getByUserAndLanguage — pagination', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calculates correct pagination for page 1 of 25 texts', async () => {
    mockedTextData.getByUserAndLanguage.mockResolvedValue({
      rows: [{ ...fakeTextDB, totaltexts: '25' }],
      rowCount: 1,
    } as never);
    const result = await texts.getByUserAndLanguage(1, '1', '1');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.totalTexts).toBe(25);
    expect(result.prevPage).toBe(0);
    expect(result.nextPage).toBe(2);
  });

  it('calculates correct pagination for last page', async () => {
    mockedTextData.getByUserAndLanguage.mockResolvedValue({
      rows: [{ ...fakeTextDB, totaltexts: '25' }],
      rowCount: 1,
    } as never);
    const result = await texts.getByUserAndLanguage(1, '1', '3');
    expect(result.currentPage).toBe(3);
    expect(result.totalPages).toBe(3);
    expect(result.prevPage).toBe(2);
    expect(result.nextPage).toBe(4);
  });

  it('returns totalPages 0 when no texts exist', async () => {
    mockedTextData.getByUserAndLanguage.mockResolvedValue({
      rows: [{ totaltexts: '0' }],
      rowCount: 1,
    } as never);
    const result = await texts.getByUserAndLanguage(1, '1', '1');
    expect(result.totalPages).toBe(0);
    expect(result.totalTexts).toBe(0);
  });

  it('passes (pageNumber - 1) as offset to data layer', async () => {
    mockedTextData.getByUserAndLanguage.mockResolvedValue({
      rows: [{ ...fakeTextDB, totaltexts: '5' }],
      rowCount: 1,
    } as never);
    await texts.getByUserAndLanguage(1, '1', '3');
    expect(mockedTextData.getByUserAndLanguage).toHaveBeenCalledWith(1, '1', 2);
  });
});

describe('update', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resets reading progress when text body is updated', async () => {
    mockedTextData.update.mockResolvedValue({
      rows: [fakeTextDB],
      rowCount: 1,
    } as never);
    mockedReadingProgressData.deleteByTextId.mockResolvedValue(
      undefined as never
    );
    const textObj = {
      id: 1,
      userId: 1,
      languageId: '1',
      title: 'Updated',
      body: 'New body',
    };
    await texts.update(textObj);
    expect(mockedReadingProgressData.deleteByTextId).toHaveBeenCalledWith(1);
  });
});
