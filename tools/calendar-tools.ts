import { tool } from "ai"
import { z } from "zod"
import {
  fetchGoogleCalendars,
  fetchAllSelectedCalendarEvents,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} from "@/lib/integrations/google/google-calendar"

// Internal userId field that will be injected by the agent
const userIdSchema = z.string().describe("The user ID (auto-injected)")

export const calendarTools = {
  listCalendars: tool({
    description: "List all Google Calendars available to the user",
    inputSchema: z.object({
      userId: userIdSchema,
    }),
    execute: async ({ userId }) => {
      const calendars = await fetchGoogleCalendars(userId)
      return {
        calendars: calendars.map((cal) => ({
          id: cal.id,
          name: cal.summary,
          description: cal.description,
          primary: cal.primary,
          accessRole: cal.accessRole,
          backgroundColor: cal.backgroundColor,
        })),
        count: calendars.length,
      }
    },
  }),

  listEvents: tool({
    description: "List calendar events from selected calendars within a time range",
    inputSchema: z.object({
      userId: userIdSchema,
      timeMin: z.string().optional().describe("ISO date string for start of time range"),
      timeMax: z.string().optional().describe("ISO date string for end of time range"),
    }),
    execute: async ({ userId, timeMin, timeMax }) => {
      const events = await fetchAllSelectedCalendarEvents(userId, {
        timeMin: timeMin ? new Date(timeMin) : new Date(),
        timeMax: timeMax ? new Date(timeMax) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      return {
        events: events.map((e) => ({
          id: e.id,
          title: e.summary,
          description: e.description,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          location: e.location,
          calendarId: e.calendarId,
          attendees: e.attendees?.map((a) => a.email),
          htmlLink: e.htmlLink,
        })),
        count: events.length,
      }
    },
  }),

  getTodayEvents: tool({
    description: "Get all events scheduled for today",
    inputSchema: z.object({
      userId: userIdSchema,
    }),
    execute: async ({ userId }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const events = await fetchAllSelectedCalendarEvents(userId, {
        timeMin: today,
        timeMax: tomorrow,
      })
      return {
        events: events.map((e) => ({
          title: e.summary,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          location: e.location,
          attendees: e.attendees?.map((a) => a.email),
        })),
        count: events.length,
      }
    },
  }),

  createEvent: tool({
    description: "Create a new calendar event",
    inputSchema: z.object({
      userId: userIdSchema,
      calendarId: z.string().describe('Calendar ID to create event in (use "primary" for default calendar)'),
      title: z.string().describe("Event title/summary"),
      description: z.string().optional().describe("Event description"),
      start: z.string().describe("ISO date string for event start"),
      end: z.string().describe("ISO date string for event end"),
      location: z.string().optional().describe("Event location"),
      attendees: z.array(z.string()).optional().describe("Array of attendee email addresses"),
    }),
    execute: async ({ userId, calendarId, title, description, start, end, location, attendees }) => {
      const event = await createGoogleEvent(userId, calendarId, {
        summary: title,
        description,
        start: new Date(start),
        end: new Date(end),
        location,
        attendees,
      })
      return {
        success: true,
        eventId: event.id,
        title: event.summary,
        htmlLink: event.htmlLink,
      }
    },
  }),

  updateEvent: tool({
    description: "Update an existing calendar event",
    inputSchema: z.object({
      userId: userIdSchema,
      calendarId: z.string().describe("Calendar ID containing the event"),
      eventId: z.string().describe("Event ID to update"),
      title: z.string().optional().describe("New event title"),
      description: z.string().optional().describe("New event description"),
      start: z.string().optional().describe("New start time as ISO date string"),
      end: z.string().optional().describe("New end time as ISO date string"),
      location: z.string().optional().describe("New event location"),
    }),
    execute: async ({ userId, calendarId, eventId, title, description, start, end, location }) => {
      const event = await updateGoogleEvent(userId, calendarId, eventId, {
        summary: title,
        description,
        start: start ? new Date(start) : undefined,
        end: end ? new Date(end) : undefined,
        location,
      })
      return {
        success: true,
        eventId: event.id,
        title: event.summary,
      }
    },
  }),

  deleteEvent: tool({
    description: "Delete a calendar event",
    inputSchema: z.object({
      userId: userIdSchema,
      calendarId: z.string().describe("Calendar ID containing the event"),
      eventId: z.string().describe("Event ID to delete"),
    }),
    execute: async ({ userId, calendarId, eventId }) => {
      await deleteGoogleEvent(userId, calendarId, eventId)
      return {
        success: true,
        message: "Event deleted successfully",
      }
    },
  }),
}
