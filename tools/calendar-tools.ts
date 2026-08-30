import { tool } from "ai";
import { z } from "zod";
import {
  createGoogleEvent,
  deleteGoogleEvent,
  fetchAllSelectedCalendarEvents,
  fetchGoogleCalendars,
  getGoogleCalendar,
  updateGoogleEvent,
} from "@/lib/integrations/google/google-calendar";
import { isoDateTimeSchema } from "@/lib/schemas/calendar";

// Every tool receives the authenticated userId via `context`, validated by
// this schema, and populated server-side through `toolsContext` in the agent
// call - never something the model can see or override.
const userContextSchema = z.object({ userId: z.string() });

const calendarIdSchema = z.string().min(1).max(1_000);
const emailSchema = z.string().email();
const timeRangeSchema = z
  .object({
    timeMin: isoDateTimeSchema.optional(),
    timeMax: isoDateTimeSchema.optional(),
  })
  .superRefine(({ timeMin, timeMax }, context) => {
    if (timeMin && timeMax && new Date(timeMax) <= new Date(timeMin)) {
      context.addIssue({
        code: "custom",
        path: ["timeMax"],
        message: "timeMax must be after timeMin",
      });
    }
  });

const createEventInputSchema = z
  .object({
    calendarId: calendarIdSchema.describe("Calendar ID to create the event in"),
    title: z.string().trim().min(1).max(500).describe("Event title"),
    description: z.string().trim().max(10_000).optional(),
    start: isoDateTimeSchema.describe("ISO date string for event start"),
    end: isoDateTimeSchema.describe("ISO date string for event end"),
    location: z.string().trim().max(1_000).optional(),
    attendees: z.array(emailSchema).max(200).optional(),
  })
  .superRefine(({ start, end }, context) => {
    if (new Date(end) <= new Date(start)) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "End must be after start",
      });
    }
  });

const updateEventInputSchema = z
  .object({
    calendarId: calendarIdSchema,
    eventId: z.string().min(1).max(1_000),
    title: z.string().trim().min(1).max(500).optional(),
    description: z.string().trim().max(10_000).optional(),
    start: isoDateTimeSchema.optional(),
    end: isoDateTimeSchema.optional(),
    location: z.string().trim().max(1_000).optional(),
  })
  .superRefine(({ title, description, start, end, location }, context) => {
    if (
      [title, description, start, end, location].every(
        (value) => value === undefined,
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "At least one field must be updated",
      });
    }
    if ((start === undefined) !== (end === undefined)) {
      context.addIssue({
        code: "custom",
        path: ["start"],
        message: "Start and end must be updated together",
      });
    }
    if (start && end && new Date(end) <= new Date(start)) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "End must be after start",
      });
    }
  });

async function requireCalendarAccess(userId: string, calendarId: string) {
  if (!(await getGoogleCalendar(userId, calendarId))) {
    throw new Error("Calendar is unavailable");
  }
}

export const calendarTools = {
  listCalendars: tool({
    description: "List all Google Calendars available to the user",
    inputSchema: z.object({}),
    contextSchema: userContextSchema,
    execute: async (_input, { context }) => {
      const calendars = await fetchGoogleCalendars(context.userId);
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
      };
    },
  }),

  listEvents: tool({
    description:
      "List calendar events from selected calendars within a time range",
    inputSchema: timeRangeSchema,
    contextSchema: userContextSchema,
    execute: async ({ timeMin, timeMax }, { context }) => {
      const events = await fetchAllSelectedCalendarEvents(context.userId, {
        timeMin: timeMin ? new Date(timeMin) : new Date(),
        timeMax: timeMax
          ? new Date(timeMax)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
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
      };
    },
  }),

  getTodayEvents: tool({
    description: "Get all events scheduled for today",
    inputSchema: z.object({}),
    contextSchema: userContextSchema,
    execute: async (_input, { context }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const events = await fetchAllSelectedCalendarEvents(context.userId, {
        timeMin: today,
        timeMax: tomorrow,
      });
      return {
        events: events.map((e) => ({
          title: e.summary,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          location: e.location,
          attendees: e.attendees?.map((a) => a.email),
        })),
        count: events.length,
      };
    },
  }),

  createEvent: tool({
    description: "Create a new calendar event",
    inputSchema: createEventInputSchema,
    contextSchema: userContextSchema,
    execute: async (
      { calendarId, title, description, start, end, location, attendees },
      { context },
    ) => {
      await requireCalendarAccess(context.userId, calendarId);
      const event = await createGoogleEvent(context.userId, calendarId, {
        summary: title,
        description,
        start: new Date(start),
        end: new Date(end),
        location,
        attendees,
      });
      return {
        success: true,
        eventId: event.id,
        title: event.summary,
        htmlLink: event.htmlLink,
      };
    },
  }),

  updateEvent: tool({
    description: "Update an existing calendar event",
    inputSchema: updateEventInputSchema,
    contextSchema: userContextSchema,
    execute: async (
      { calendarId, eventId, title, description, start, end, location },
      { context },
    ) => {
      await requireCalendarAccess(context.userId, calendarId);
      const event = await updateGoogleEvent(
        context.userId,
        calendarId,
        eventId,
        {
          summary: title,
          description,
          start: start ? new Date(start) : undefined,
          end: end ? new Date(end) : undefined,
          location,
        },
      );
      return { success: true, eventId: event.id, title: event.summary };
    },
  }),

  deleteEvent: tool({
    description: "Delete a calendar event",
    inputSchema: z.object({
      calendarId: calendarIdSchema.describe("Calendar ID containing the event"),
      eventId: z.string().min(1).max(1_000).describe("Event ID to delete"),
    }),
    contextSchema: userContextSchema,
    execute: async ({ calendarId, eventId }, { context }) => {
      await requireCalendarAccess(context.userId, calendarId);
      await deleteGoogleEvent(context.userId, calendarId, eventId);
      return { success: true, message: "Event deleted successfully" };
    },
  }),
};

export const calendarToolsContext = (userId: string) => ({
  listCalendars: { userId },
  listEvents: { userId },
  getTodayEvents: { userId },
  createEvent: { userId },
  updateEvent: { userId },
  deleteEvent: { userId },
});
