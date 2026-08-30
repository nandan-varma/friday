import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { z } from "zod";
import { db, schema } from "@/db";

const environmentSchema = z.object({
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must contain at least 32 characters"),
  NEXT_PUBLIC_APP_URL: z.url(),
  GOOGLE_CREDENTIALS: z.string().min(1),
});

const environment = environmentSchema.parse(process.env);
const googleCredentialsSchema = z.object({
  web: z.object({
    client_id: z.string().min(1),
    client_secret: z.string().min(1),
  }),
});
const googleCredentials = googleCredentialsSchema.parse(
  JSON.parse(environment.GOOGLE_CREDENTIALS),
).web;

export const auth = betterAuth({
  secret: environment.AUTH_SECRET,
  baseURL: environment.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  account: {
    // Better Auth encrypts OAuth access/refresh tokens with `secret` before
    // storing them and decrypts internally on refresh - no custom crypto needed.
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: googleCredentials.client_id,
      clientSecret: googleCredentials.client_secret,
      accessType: "offline",
      prompt: "select_account consent",
      scope: ["https://www.googleapis.com/auth/calendar"],
    },
  },
  plugins: [
    passkey(),
    nextCookies(), // must be last
  ],
});
