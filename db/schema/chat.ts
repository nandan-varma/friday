import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Persisted chat sessions, used for both history and resumable AI SDK streams.
export const chat = pgTable(
  "chat",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    messages: jsonb("messages").notNull().default([]),
    activeStreamId: text("active_stream_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("chat_userId_idx").on(table.userId)],
);

export type Chat = typeof chat.$inferSelect;
