import { db } from "@/lib/db"
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }), 
  emailAndPassword: {
    enabled: true,
  },
  plugins : [
    nextCookies()
  ],
  trustedOrigins: (env.TRUSTED_ORIGINS || "http://localhost:3000").split(',').map(s => s.trim()),
  //... the rest of your config
});

