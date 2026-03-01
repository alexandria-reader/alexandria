import { z } from 'zod';
import {
  LanguageSchema,
  TextSchema,
  TranslationSchema,
  UserTranslationSchema,
  UserWordSchema,
  WebdictionarySchema,
  TextPaginationSchema,
  ReadingProgressSchema,
  SanitizedUserSchema,
  LoggedInUserSchema,
} from './schemas';

export type Language = z.infer<typeof LanguageSchema>;
export type Text = z.infer<typeof TextSchema>;
export type Translation = z.infer<typeof TranslationSchema>;
export type UserTranslation = z.infer<typeof UserTranslationSchema>;
export type UserWord = z.infer<typeof UserWordSchema>;
export type Webdictionary = z.infer<typeof WebdictionarySchema>;
export type TextPagination = z.infer<typeof TextPaginationSchema>;
export type ReadingProgress = z.infer<typeof ReadingProgressSchema>;
export type SanitizedUser = z.infer<typeof SanitizedUserSchema>;
export type LoggedInUser = z.infer<typeof LoggedInUserSchema>;
