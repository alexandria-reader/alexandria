import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z
      .enum(['development', 'test', 'staging', 'production'])
      .default('development'),
    RESEND_API_KEY: z.string().optional(),
    SERVER_URL: z.string().optional(),
    DATABASE_SSL: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    CORS_ORIGIN: z.string().default('*'),
    DEBUG: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV === 'production' || val.NODE_ENV === 'staging') {
      if (!val.RESEND_API_KEY) {
        ctx.addIssue({
          code: 'custom',
          message: 'RESEND_API_KEY is required in production/staging',
          path: ['RESEND_API_KEY'],
        });
      }
      if (!val.SERVER_URL) {
        ctx.addIssue({
          code: 'custom',
          message: 'SERVER_URL is required in production/staging',
          path: ['SERVER_URL'],
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

const env = parsed.data;
export default env;
