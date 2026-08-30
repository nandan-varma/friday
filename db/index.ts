import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./schema/auth";
import * as calendarSchema from "./schema/calendar";
import * as chatSchema from "./schema/chat";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

export const schema = { ...authSchema, ...calendarSchema, ...chatSchema };

export const db = drizzle(process.env.DATABASE_URL, { schema });
