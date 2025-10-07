import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_CREDENTIALS: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  TRUSTED_ORIGINS: z.string().optional().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);