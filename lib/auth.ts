import { db } from "@/lib/db"
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
 
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
  trustedOrigins: [
    "http://localhost:3000",
  ]
  //... the rest of your config
});
