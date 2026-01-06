import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const googleCalendarIntegration = pgTable("google_calendar_integration", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  googleUserId: text("google_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry").notNull(),
  selectedCalendarIds: text("selected_calendar_ids"), // JSON array of calendar IDs to sync
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GoogleCalendarIntegration = typeof googleCalendarIntegration.$inferSelect;
export type NewGoogleCalendarIntegration = typeof googleCalendarIntegration.$inferInsert;
