export type ConnectionOptions = {
  connectionString: string | undefined;
  ssl: boolean | object;
};

export type Language = {
  id: string;
  name: string;
  flag: string;
  eachCharIsWord: boolean;
  isRightToLeft: boolean;
};

export type LanguageDB = {
  id: string;
  name: string;
  flag: string;
  each_char_is_word: boolean;
  is_right_to_left: boolean;
};

export const convertLanguageTypes = function (dbItem: LanguageDB): Language {
  const {
    id,
    name,
    flag,
    each_char_is_word: eachCharIsWord,
    is_right_to_left: isRightToLeft,
  } = dbItem;
  return {
    id,
    name,
    flag,
    eachCharIsWord,
    isRightToLeft,
  };
};

export type User = {
  id?: number;
  username: string;
  passwordHash: string;
  email: string;
  knownLanguageId: string;
  learnLanguageId: string;
  verified: boolean;
  verificationCode: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDB = {
  id: number;
  username: string;
  password_hash: string;
  email: string;
  known_language_id: string;
  learn_language_id: string;
  verified: boolean;
  verification_code: string;
  created_at: string;
  updated_at: string;
};

export type SanitizedUser = Omit<User, 'passwordHash' | 'verificationCode'>;

export type LoggedInUser = SanitizedUser & { token: string };

export const convertUserTypes = function (dbItem: UserDB): User {
  const {
    id,
    username,
    password_hash: passwordHash,
    email,
    known_language_id: knownLanguageId,
    learn_language_id: learnLanguageId,
    verified,
    verification_code: verificationCode,
    created_at: createdAt,
    updated_at: updatedAt,
  } = dbItem;
  return {
    id,
    username,
    passwordHash,
    email,
    knownLanguageId,
    learnLanguageId,
    verified,
    verificationCode,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
};

export type Text = {
  id?: number;
  userId: number;
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

export type TextDB = {
  id: number;
  user_id: number;
  language_id: string;
  title: string;
  author: string | null;
  body: string;
  source_url: string | null;
  source_type: string | null;
  upload_time: string;
  is_public: boolean;
};

export const convertTextTypes = function (dbItem: TextDB): Text {
  const {
    id,
    user_id: userId,
    language_id: languageId,
    title,
    author,
    body,
    source_url: sourceURL,
    source_type: sourceType,
    upload_time: uploadTime,
    is_public: isPublic,
  } = dbItem;
  return {
    id,
    userId,
    languageId,
    title,
    author,
    body,
    sourceURL,
    sourceType,
    uploadTime: new Date(uploadTime),
    isPublic,
  };
};

export type Word = {
  id?: number;
  languageId: string;
  word: string;
};

export type WordDB = {
  id: number;
  language_id: string;
  word: string;
};

export const convertWordTypes = function (dbItem: WordDB): Word {
  const { id, language_id: languageId, word } = dbItem;
  return {
    id,
    languageId,
    word,
  };
};

export type Webdictionary = {
  id?: number;
  sourceLanguageId: string;
  targetLanguageId: string;
  name: string;
  url: string;
};

export type WebdictionaryDB = {
  id: number;
  source_language_id: string;
  target_language_id: string;
  name: string;
  url: string;
};

export const convertWebdictionaryTypes = function (
  dbItem: WebdictionaryDB
): Webdictionary {
  const {
    id,
    source_language_id: sourceLanguageId,
    target_language_id: targetLanguageId,
    name,
    url,
  } = dbItem;
  return {
    id,
    sourceLanguageId,
    targetLanguageId,
    name,
    url,
  };
};

export type Translation = {
  id?: number;
  wordId: number;
  translation: string;
  targetLanguageId: string;
};

export type TranslationDB = {
  id: number;
  word_id: number;
  translation: string;
  target_language_id: string;
};

export const convertTranslationTypes = function (
  dbItem: TranslationDB
): Translation {
  const {
    id,
    word_id: wordId,
    translation,
    target_language_id: targetLanguageId,
  } = dbItem;
  return {
    id,
    wordId,
    translation,
    targetLanguageId,
  };
};

export type UserTranslation = Translation & { context?: string };

export type UserWord = {
  id?: number;
  word: string;
  status: string;
  translations: Array<UserTranslation>;
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
  updatedAt: Date;
};

export type ReadingProgressDB = {
  user_id: number;
  text_id: number;
  page_start_word_index: number;
  updated_at: string;
};

export const convertReadingProgressTypes = function (
  dbItem: ReadingProgressDB
): ReadingProgress {
  const {
    user_id: userId,
    text_id: textId,
    page_start_word_index: pageStartWordIndex,
    updated_at: updatedAt,
  } = dbItem;
  return {
    userId,
    textId,
    pageStartWordIndex,
    updatedAt: new Date(updatedAt),
  };
};
