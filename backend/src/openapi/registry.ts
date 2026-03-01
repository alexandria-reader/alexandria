import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

export const registry = new OpenAPIRegistry();

// ---------------------------------------------------------------------------
// Security scheme
// ---------------------------------------------------------------------------

registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// ---------------------------------------------------------------------------
// Error response schema (boom format)
// ---------------------------------------------------------------------------

export const ErrorResponseSchema = z
  .object({
    error: z.object({
      statusCode: z.number(),
      error: z.string(),
      message: z.string(),
    }),
  })
  .meta({ id: 'ErrorResponse' });
