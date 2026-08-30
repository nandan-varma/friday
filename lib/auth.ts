import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db, schema } from "@/db";

// Google's downloaded OAuth client JSON: { web: { client_id, client_secret, ... } }
const googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS!).web as {
  client_id: string;
  client_secret: string;
};

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
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
