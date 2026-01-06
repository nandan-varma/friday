import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const calendar = pgTable("calendar", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#3b82f6"),
  isDefault: boolean("is_default").default(false).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const event = pgTable("event", {
  id: text("id").primaryKey(),
  calendarId: text("calendar_id")
    .notNull()
    .references(() => calendar.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  allDay: boolean("all_day").default(false).notNull(),
  color: text("color"),
  recurrence: text("recurrence"), // RRULE format for recurring events
  reminders: text("reminders"), // JSON string array: ["15min", "1hour", "1day"]
  attendees: text("attendees"), // JSON string array of email addresses
  videoConferenceUrl: text("video_conference_url"),
  status: text("status").default("confirmed").notNull(), // confirmed, tentative, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Calendar = typeof calendar.$inferSelect;
export type NewCalendar = typeof calendar.$inferInsert;
export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;
