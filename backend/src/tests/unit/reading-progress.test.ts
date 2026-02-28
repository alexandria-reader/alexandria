import readingProgress from '../../services/reading-progress';

jest.mock('../../data-access/reading-progress');

import readingProgressData from '../../data-access/reading-progress';

const mockedData = jest.mocked(readingProgressData);

describe('save', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects negative pageStartWordIndex', async () => {
    await expect(readingProgress.save(1, 1, -1)).rejects.toThrow(
      'pageStartWordIndex must be >= 0'
    );
  });

  it('accepts zero pageStartWordIndex', async () => {
    mockedData.upsert.mockResolvedValue({
      rows: [
        {
          user_id: 1,
          text_id: 1,
          page_start_word_index: 0,
          updated_at: '2024-01-01',
        },
      ],
    } as never);
    const result = await readingProgress.save(1, 1, 0);
    expect(result).toHaveProperty('pageStartWordIndex', 0);
  });

  it('accepts positive pageStartWordIndex', async () => {
    mockedData.upsert.mockResolvedValue({
      rows: [
        {
          user_id: 1,
          text_id: 1,
          page_start_word_index: 50,
          updated_at: '2024-01-01',
        },
      ],
    } as never);
    const result = await readingProgress.save(1, 1, 50);
    expect(result).toHaveProperty('pageStartWordIndex', 50);
  });
});
