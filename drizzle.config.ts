import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { z } from "zod";

config({ path: ".env.local" });

const databaseUrl = z.string().url().parse(process.env.DATABASE_URL);

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
