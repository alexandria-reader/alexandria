import { z } from 'zod';
import { registry, ErrorResponseSchema } from './registry';
import {
  LanguageSchema,
  TextSchema,
  CreateTextRequestSchema,
  UpdateTextRequestSchema,
  TranslationSchema,
  UserTranslationSchema,
  UserWordSchema,
  WebdictionarySchema,
  TextPaginationSchema,
  ReadingProgressSchema,
  SanitizedUserSchema,
  LoggedInUserSchema,
  LoginRequestSchema,
  CreateUserRequestSchema,
  ConfirmPasswordRequestSchema,
  UpdateUserInfoRequestSchema,
  ChangePasswordRequestSchema,
  SetLanguagesRequestSchema,
  SaveProgressRequestSchema,
  AddTranslationRequestSchema,
  UpdateTranslationRequestSchema,
  UpdateWordRequestSchema,
  ExtractUrlRequestSchema,
} from '@alexandria/shared';

const bearerAuth = [{ BearerAuth: [] }];

function errorResponse(description: string) {
  return {
    description,
    content: { 'application/json': { schema: ErrorResponseSchema } },
  };
}

// ---------------------------------------------------------------------------
// Languages (no auth)
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/languages',
  summary: 'Get all languages',
  tags: ['Languages'],
  responses: {
    200: {
      description: 'List of supported languages',
      content: { 'application/json': { schema: z.array(LanguageSchema) } },
    },
  },
});

// ---------------------------------------------------------------------------
// Webdictionaries (no auth)
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/webdictionaries/source/{sourceId}/target/{targetId}',
  summary: 'Get dictionaries by source and target language',
  tags: ['Webdictionaries'],
  request: {
    params: z.object({
      sourceId: z.string(),
      targetId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List of web dictionaries',
      content: { 'application/json': { schema: z.array(WebdictionarySchema) } },
    },
  },
});

// ---------------------------------------------------------------------------
// Login (no auth)
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'post',
  path: '/api/login',
  summary: 'Log in with email and password',
  tags: ['Auth'],
  request: {
    body: {
      content: { 'application/json': { schema: LoginRequestSchema } },
    },
  },
  responses: {
    200: {
      description: 'Logged-in user with JWT token',
      content: { 'application/json': { schema: LoggedInUserSchema } },
    },
    401: errorResponse('Invalid credentials'),
  },
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/users/from-token',
  summary: 'Get current user from JWT',
  tags: ['Users'],
  security: bearerAuth,
  responses: {
    200: {
      description: 'Current user',
      content: { 'application/json': { schema: SanitizedUserSchema } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users',
  summary: 'Get all users (admin only)',
  tags: ['Users'],
  security: bearerAuth,
  responses: {
    200: {
      description: 'List of all users',
      content: {
        'application/json': { schema: z.array(SanitizedUserSchema) },
      },
    },
    401: errorResponse('Not authenticated'),
    403: errorResponse('Admin access required'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users/confirm',
  summary: 'Confirm password matches current user',
  tags: ['Users'],
  security: bearerAuth,
  request: {
    body: {
      content: {
        'application/json': {
          schema: ConfirmPasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password match result',
      content: {
        'application/json': {
          schema: z.object({ match: z.enum(['true', 'false']) }),
        },
      },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users',
  summary: 'Register a new user',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created user',
      content: { 'application/json': { schema: LoggedInUserSchema } },
    },
    409: errorResponse('Email already in use'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/users/update-info',
  summary: 'Update username or email',
  tags: ['Users'],
  security: bearerAuth,
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateUserInfoRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated user',
      content: { 'application/json': { schema: SanitizedUserSchema } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/users/change-password',
  summary: 'Change password',
  tags: ['Users'],
  security: bearerAuth,
  request: {
    body: {
      content: {
        'application/json': {
          schema: ChangePasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated user',
      content: { 'application/json': { schema: SanitizedUserSchema } },
    },
    401: errorResponse('Incorrect current password'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/users/set-languages',
  summary: 'Set known and learning languages',
  tags: ['Users'],
  security: bearerAuth,
  request: {
    body: {
      content: {
        'application/json': {
          schema: SetLanguagesRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated user',
      content: { 'application/json': { schema: SanitizedUserSchema } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/users',
  summary: 'Delete current user',
  tags: ['Users'],
  security: bearerAuth,
  responses: {
    204: { description: 'User deleted' },
    401: errorResponse('Not authenticated'),
  },
});

// ---------------------------------------------------------------------------
// Texts (all require auth)
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/texts/language/{languageId}/{page}',
  summary: 'Get paginated texts by language',
  tags: ['Texts'],
  security: bearerAuth,
  request: {
    params: z.object({
      languageId: z.string(),
      page: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Paginated text list',
      content: { 'application/json': { schema: TextPaginationSchema } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/texts/{id}',
  summary: 'Get a text by ID',
  tags: ['Texts'],
  security: bearerAuth,
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Text object',
      content: { 'application/json': { schema: TextSchema } },
    },
    401: errorResponse('Not authenticated'),
    403: errorResponse('Not your text'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/texts',
  summary: 'Get all texts (admin only)',
  tags: ['Texts'],
  security: bearerAuth,
  responses: {
    200: {
      description: 'All texts',
      content: { 'application/json': { schema: z.array(TextSchema) } },
    },
    401: errorResponse('Not authenticated'),
    403: errorResponse('Admin access required'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/texts',
  summary: 'Create a new text',
  tags: ['Texts'],
  security: bearerAuth,
  request: {
    body: {
      content: { 'application/json': { schema: CreateTextRequestSchema } },
    },
  },
  responses: {
    201: {
      description: 'Created text',
      content: { 'application/json': { schema: TextSchema } },
    },
    401: errorResponse('Not authenticated'),
    403: errorResponse('Email not verified'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/texts/{id}/progress',
  summary: 'Save reading progress for a text',
  tags: ['Texts'],
  security: bearerAuth,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: SaveProgressRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Saved reading progress',
      content: { 'application/json': { schema: ReadingProgressSchema } },
    },
    401: errorResponse('Not authenticated'),
    403: errorResponse('Not your text'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/texts/{id}',
  summary: 'Update a text',
  tags: ['Texts'],
  security: bearerAuth,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { 'application/json': { schema: UpdateTextRequestSchema } },
    },
  },
  responses: {
    200: {
      description: 'Updated text',
      content: { 'application/json': { schema: TextSchema } },
    },
    401: errorResponse('Not authenticated'),
    403: errorResponse('Not your text'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/texts/{id}',
  summary: 'Delete a text',
  tags: ['Texts'],
  security: bearerAuth,
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: 'Text deleted' },
    401: errorResponse('Not authenticated'),
    403: errorResponse('Not your text'),
  },
});

// ---------------------------------------------------------------------------
// Words (all require auth)
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/words/text/{textId}/language/{languageId}',
  summary: 'Get user words in a specific text',
  tags: ['Words'],
  security: bearerAuth,
  request: {
    params: z.object({
      textId: z.string(),
      languageId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'User words in the text',
      content: { 'application/json': { schema: z.array(UserWordSchema) } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/words/language/{languageId}',
  summary: 'Get all user words for a language',
  tags: ['Words'],
  security: bearerAuth,
  request: {
    params: z.object({ languageId: z.string() }),
  },
  responses: {
    200: {
      description: 'User words for the language',
      content: { 'application/json': { schema: z.array(UserWordSchema) } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/words',
  summary: 'Add a new user word',
  tags: ['Words'],
  security: bearerAuth,
  request: {
    body: {
      content: { 'application/json': { schema: UserWordSchema } },
    },
  },
  responses: {
    201: {
      description: 'Created user word',
      content: { 'application/json': { schema: UserWordSchema } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/words/{id}',
  summary: 'Update word status or remove user word',
  description:
    'If `status` is provided, updates the word status. Otherwise, removes the user-word association.',
  tags: ['Words'],
  security: bearerAuth,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: UpdateWordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated word status',
      content: { 'application/json': { schema: z.string() } },
    },
    204: { description: 'User word removed' },
    401: errorResponse('Not authenticated'),
  },
});

// ---------------------------------------------------------------------------
// Translations (all require auth)
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'post',
  path: '/api/translations',
  summary: 'Add a translation for a word',
  tags: ['Translations'],
  security: bearerAuth,
  request: {
    body: {
      content: {
        'application/json': {
          schema: AddTranslationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Created translation',
      content: { 'application/json': { schema: TranslationSchema } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/translations/{id}',
  summary: 'Update a translation',
  tags: ['Translations'],
  security: bearerAuth,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: UpdateTranslationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated translation with context',
      content: { 'application/json': { schema: UserTranslationSchema } },
    },
    401: errorResponse('Not authenticated'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/translations/{id}',
  summary: 'Delete a translation',
  tags: ['Translations'],
  security: bearerAuth,
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: 'Translation deleted' },
    401: errorResponse('Not authenticated'),
  },
});

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/verify/resend-email',
  summary: 'Resend verification email',
  tags: ['Verification'],
  security: bearerAuth,
  responses: {
    200: {
      description: 'Confirmation message',
      content: { 'text/plain': { schema: z.string() } },
    },
    401: errorResponse('Not authenticated'),
    502: errorResponse('Failed to send email'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/verify/{code}/{token}',
  summary: 'Verify email with code and token',
  tags: ['Verification'],
  request: {
    params: z.object({
      code: z.string(),
      token: z.string(),
    }),
  },
  responses: {
    302: { description: 'Redirects to /verify on the frontend' },
  },
});

// ---------------------------------------------------------------------------
// URL extraction (requires auth)
// ---------------------------------------------------------------------------

registry.registerPath({
  method: 'post',
  path: '/api/url',
  summary: 'Extract article content from a URL',
  description:
    'Attempts extraction with a 2-second timeout. Returns 204 if extraction takes too long.',
  tags: ['URL'],
  security: bearerAuth,
  request: {
    body: {
      content: {
        'application/json': {
          schema: ExtractUrlRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Extracted article data',
      content: {
        'application/json': {
          schema: z
            .object({
              url: z.string().optional(),
              title: z.string().optional(),
              description: z.string().optional(),
              image: z.string().optional(),
              author: z.string().optional(),
              content: z.string().optional(),
              published: z.string().optional(),
              source: z.string().optional(),
              links: z.array(z.string()).optional(),
              ttr: z.number().optional(),
            })
            .meta({ id: 'ArticleData' }),
        },
      },
    },
    204: { description: 'Extraction timed out' },
    400: errorResponse('Could not extract article'),
    401: errorResponse('Not authenticated'),
  },
});
