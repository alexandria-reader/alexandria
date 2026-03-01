import { z } from 'zod';

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

export const LanguageSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    flag: z.string(),
    eachCharIsWord: z.boolean(),
    isRightToLeft: z.boolean(),
  })
  .meta({ id: 'Language' });

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

export const TextSchema = z
  .object({
    id: z.number().optional(),
    userId: z.number().optional(),
    languageId: z.string(),
    title: z.string(),
    author: z.string().nullable().optional(),
    body: z.string(),
    sourceURL: z.string().nullable().optional(),
    sourceType: z.string().nullable().optional(),
    uploadTime: z.date().optional(),
    isPublic: z.boolean().optional(),
    pageStartWordIndex: z.number().optional(),
  })
  .meta({ id: 'Text' });

export const CreateTextRequestSchema = z
  .object({
    languageId: z.string(),
    title: z.string(),
    body: z.string(),
    author: z.string().nullable().optional(),
    sourceURL: z.string().nullable().optional(),
    sourceType: z.string().nullable().optional(),
    isPublic: z.boolean().optional(),
  })
  .meta({ id: 'CreateTextRequest' });

export const UpdateTextRequestSchema = CreateTextRequestSchema.partial()
  .extend({
    pageStartWordIndex: z.number().optional(),
  })
  .meta({ id: 'UpdateTextRequest' });

// ---------------------------------------------------------------------------
// Translation
// ---------------------------------------------------------------------------

export const TranslationSchema = z
  .object({
    id: z.number().optional(),
    wordId: z.number().optional(),
    translation: z.string(),
    targetLanguageId: z.string(),
  })
  .meta({ id: 'Translation' });

export const UserTranslationSchema = TranslationSchema.extend({
  context: z.string().optional(),
}).meta({ id: 'UserTranslation' });

// ---------------------------------------------------------------------------
// UserWord
// ---------------------------------------------------------------------------

export const WordStatusSchema = z.enum(['learning', 'familiar', 'learned']);

export const UserWordSchema = z
  .object({
    id: z.number().optional(),
    word: z.string(),
    status: WordStatusSchema.optional(),
    translations: z.array(UserTranslationSchema),
    languageId: z.string().optional(),
  })
  .meta({ id: 'UserWord' });

// ---------------------------------------------------------------------------
// Webdictionary
// ---------------------------------------------------------------------------

export const WebdictionarySchema = z
  .object({
    id: z.number().optional(),
    sourceLanguageId: z.string(),
    targetLanguageId: z.string(),
    name: z.string(),
    url: z.string(),
  })
  .meta({ id: 'Webdictionary' });

// ---------------------------------------------------------------------------
// TextPagination
// ---------------------------------------------------------------------------

export const TextPaginationSchema = z
  .object({
    currentPage: z.number(),
    nextPage: z.number(),
    prevPage: z.number(),
    data: z.array(TextSchema),
    totalPages: z.number(),
    totalTexts: z.number(),
  })
  .meta({ id: 'TextPagination' });

// ---------------------------------------------------------------------------
// ReadingProgress
// ---------------------------------------------------------------------------

export const ReadingProgressSchema = z
  .object({
    userId: z.number(),
    textId: z.number(),
    pageStartWordIndex: z.number(),
    updatedAt: z.string(),
  })
  .meta({ id: 'ReadingProgress' });

// ---------------------------------------------------------------------------
// User (sanitized — no password/hash)
// ---------------------------------------------------------------------------

export const SanitizedUserSchema = z
  .object({
    id: z.number().optional(),
    username: z.string(),
    email: z.string(),
    knownLanguageId: z.string(),
    learnLanguageId: z.string(),
    verified: z.boolean().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .meta({ id: 'SanitizedUser' });

export const LoggedInUserSchema = SanitizedUserSchema.extend({
  token: z.string(),
}).meta({ id: 'LoggedInUser' });

// ---------------------------------------------------------------------------
// Request schemas for user operations
// ---------------------------------------------------------------------------

export const CreateUserRequestSchema = z
  .object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
    knownLanguageId: z.string(),
    learnLanguageId: z.string(),
  })
  .meta({ id: 'CreateUserRequest' });

export const UpdateUserRequestSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().optional(),
    knownLanguageId: z.string().optional(),
    learnLanguageId: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .meta({ id: 'UpdateUserRequest' });

export const LoginRequestSchema = z
  .object({
    email: z.string(),
    password: z.string(),
  })
  .meta({ id: 'LoginRequest' });

export const ConfirmPasswordRequestSchema = z
  .object({
    password: z.string().min(1),
  })
  .meta({ id: 'ConfirmPasswordRequest' });

export const UpdateUserInfoRequestSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().optional(),
  })
  .meta({ id: 'UpdateUserInfoRequest' });

export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(1),
  })
  .meta({ id: 'ChangePasswordRequest' });

export const SetLanguagesRequestSchema = z
  .object({
    knownLanguageId: z.string().min(1),
    learnLanguageId: z.string().min(1),
  })
  .meta({ id: 'SetLanguagesRequest' });

// ---------------------------------------------------------------------------
// Request schemas for text operations
// ---------------------------------------------------------------------------

export const SaveProgressRequestSchema = z
  .object({
    pageStartWordIndex: z.number().int(),
  })
  .meta({ id: 'SaveProgressRequest' });

// ---------------------------------------------------------------------------
// Request schemas for translation operations
// ---------------------------------------------------------------------------

export const AddTranslationRequestSchema = z
  .object({
    wordId: z.number().int().positive(),
    translation: z.string().min(1),
    targetLanguageId: z.string().min(1),
    context: z.string().optional(),
  })
  .meta({ id: 'AddTranslationRequest' });

export const UpdateTranslationRequestSchema = z
  .object({
    translation: z.string().min(1),
  })
  .meta({ id: 'UpdateTranslationRequest' });

// ---------------------------------------------------------------------------
// Request schemas for word operations
// ---------------------------------------------------------------------------

export const UpdateWordRequestSchema = z
  .object({
    status: WordStatusSchema.optional(),
  })
  .meta({ id: 'UpdateWordRequest' });

// ---------------------------------------------------------------------------
// Request schemas for URL extraction
// ---------------------------------------------------------------------------

export const ExtractUrlRequestSchema = z
  .object({
    url: z.url(),
  })
  .meta({ id: 'ExtractUrlRequest' });
