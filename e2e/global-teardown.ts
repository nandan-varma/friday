import { config } from "dotenv";
import { like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { user } from "@/db/schema/auth";

// e2e signs up real users against the dev database (see e2e/auth.spec.ts).
// `account`/`session`/`chat`/`calendar_preference` all reference `user.id`
// with `onDelete: cascade`, so deleting here is enough to clean up everything
// a test run created.
export default async function globalTeardown() {
  config({ path: ".env.local" });
  if (!process.env.DATABASE_URL) return;

  const db = drizzle(process.env.DATABASE_URL);
  await db.delete(user).where(like(user.email, "e2e-%@friday-test.local"));
}
