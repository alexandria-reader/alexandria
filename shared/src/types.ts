export type Language = {
  id: string;
  name: string;
  flag: string;
  eachCharIsWord: boolean;
  isRightToLeft: boolean;
};

export type Text = {
  id?: number;
  userId?: number;
  languageId: string;
  title: string;
  author?: string | null;
  body: string;
  sourceURL?: string | null;
  sourceType?: string | null;
  uploadTime?: Date;
  isPublic?: boolean;
  pageStartWordIndex?: number;
};

export type Translation = {
  id?: number;
  wordId?: number;
  translation: string;
  targetLanguageId: string;
};

export type UserTranslation = Translation & { context?: string };

export type UserWord = {
  id?: number;
  word: string;
  status?: string;
  translations: Array<UserTranslation>;
  languageId?: string;
};

export type Webdictionary = {
  id?: number;
  sourceLanguageId: string;
  targetLanguageId: string;
  name: string;
  url: string;
};

export type TextPagination = {
  currentPage: number;
  nextPage: number;
  prevPage: number;
  data: Text[];
  totalPages: number;
  totalTexts: number;
};

export type ReadingProgress = {
  userId: number;
  textId: number;
  pageStartWordIndex: number;
  updatedAt: string;
};

export type SanitizedUser = {
  id?: number;
  username: string;
  email: string;
  knownLanguageId: string;
  learnLanguageId: string;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type LoggedInUser = SanitizedUser & { token: string };
