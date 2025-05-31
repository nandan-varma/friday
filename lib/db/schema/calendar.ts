import { pgTable, serial, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth"

// Event recurrence enum
export const recurrenceEnum = pgEnum("recurrence", ["none", "daily", "weekly", "monthly", "yearly"])

// User relations
export const usersRelations = relations(user, ({ many }) => ({
  events: many(events),
  settings: many(userSettings),
  integrations: many(integrations),
}))

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isAllDay: boolean("is_all_day").default(false),
  recurrence: recurrenceEnum("recurrence").default("none"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Event relations
export const eventsRelations = relations(events, ({ one }) => ({
  user: one(user, {
    fields: [events.userId],
    references: [user.id],
  }),
}))

// User settings table
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  timezone: text("timezone").default("UTC"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  aiSuggestionsEnabled: boolean("ai_suggestions_enabled").default(true),
  reminderTime: integer("reminder_time").default(30), // minutes before event
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// User settings relations
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, {
    fields: [userSettings.userId],
    references: [user.id],
  }),
}))

// Integrations table
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: text("type").notNull(), // e.g., "google_calendar"
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Integrations relations
export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(user, {
    fields: [integrations.userId],
    references: [user.id],
  }),
}))