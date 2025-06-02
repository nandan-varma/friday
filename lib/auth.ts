import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { compare, hash } from "bcrypt"
import { cookies } from "next/headers"
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
  ]
  //... the rest of your config
});
