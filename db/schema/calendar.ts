import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// App-level preference for which Google calendars to sync. OAuth tokens
// themselves live in Better Auth's `account` table (see lib/auth.ts
// `account.encryptOAuthTokens`), so this table only tracks selection state.
export const calendarPreference = pgTable("calendar_preference", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  selectedCalendarIds: text("selected_calendar_ids"), // JSON array of calendar IDs
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CalendarPreference = typeof calendarPreference.$inferSelect;
