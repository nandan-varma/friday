import { headers } from "next/headers";
import { parseJsonBody } from "@/lib/api";
import { auth } from "@/lib/auth";
import {
  createGoogleEvent,
  deleteGoogleEvent,
  fetchAllSelectedCalendarEvents,
  fetchGoogleCalendars,
  fetchGoogleEvents,
  getGoogleCalendar,
  isGoogleCalendarConnected,
  transformGoogleEventToCalendarEvent,
  updateGoogleEvent,
} from "@/lib/integrations/google/google-calendar";
import { createLogger } from "@/lib/logger";
import {
  calendarEventInputSchema,
  calendarEventsQuerySchema,
  calendarEventUpdateSchema,
  eventMutationSchema,
} from "@/lib/schemas/calendar";
import type { Calendar } from "@/types/calendar";

const log = createLogger("api/events");

const CALENDAR_COLORS = [
  "blue",
  "amber",
  "green",
  "pink",
  "purple",
  "red",
  "indigo",
  "cyan",
] as const;

import { z } from "zod";

const ianaTimeZone = z.string().refine((value) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}, "Invalid IANA time zone");

function toCalendars(
  googleCalendars: Awaited<ReturnType<typeof fetchGoogleCalendars>>,
): Calendar[] {
  return googleCalendars.map((cal, index) => ({
    id: cal.id ?? "primary",
    name: cal.summary || "Untitled Calendar",
    color: CALENDAR_COLORS[index % CALENDAR_COLORS.length],
    checked: true,
  }));
}

async function userCanAccessCalendar(userId: string, calendarId: string) {
  return (await getGoogleCalendar(userId, calendarId)) !== null;
}

// GET /api/events - Fetch events from Google Calendar
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isGoogleCalendarConnected(session.user.id))) {
    return Response.json(
      { error: "Google Calendar not connected" },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const queryValidation = calendarEventsQuerySchema.safeParse({
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
    calendarId: searchParams.get("calendarId") ?? undefined,
  });

  if (!queryValidation.success) {
    return Response.json(
      { error: "Validation failed", details: queryValidation.error.issues },
      { status: 400 },
    );
  }
  const { start, end, calendarId } = queryValidation.data;

  try {
    const googleCalendars = await fetchGoogleCalendars(session.user.id);
    const calendars = toCalendars(googleCalendars);

    let googleEvents: Awaited<
      ReturnType<typeof fetchAllSelectedCalendarEvents>
    >;
    if (calendarId) {
      const calendar = googleCalendars.find((item) => item.id === calendarId);
      if (!calendar) {
        return Response.json(
          { error: "Calendar is unavailable" },
          { status: 400 },
        );
      }
      const events = await fetchGoogleEvents(session.user.id, calendarId, {
        timeMin: start ? new Date(start) : undefined,
        timeMax: end ? new Date(end) : undefined,
      });
      googleEvents = events.map((event) => ({
        ...event,
        calendarId,
        accessRole: calendar?.accessRole ?? undefined,
      }));
    } else {
      googleEvents = await fetchAllSelectedCalendarEvents(session.user.id, {
        timeMin: start ? new Date(start) : undefined,
        timeMax: end ? new Date(end) : undefined,
      });
    }

    const events = googleEvents.map((event) =>
      transformGoogleEventToCalendarEvent(
        event,
        calendars,
        event.accessRole || undefined,
      ),
    );

    return Response.json(events);
  } catch (error) {
    log.error("failed to fetch events", { error });
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST /api/events - Create event in Google Calendar
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(
    request,
    calendarEventInputSchema.extend({ timeZone: ianaTimeZone.optional() }),
  );
  if (parsed.error) return parsed.error;
  const {
    calendarId,
    summary,
    description,
    location,
    start,
    end,
    attendees,
    allDay,
    timeZone,
  } = parsed.data;

  try {
    const availableCalendars = await fetchGoogleCalendars(session.user.id);
    if (!availableCalendars.some((calendar) => calendar.id === calendarId)) {
      return Response.json(
        { error: "Calendar is unavailable" },
        { status: 400 },
      );
    }
    const createdGoogleEvent = await createGoogleEvent(
      session.user.id,
      calendarId,
      {
        summary,
        description: description?.trim(),
        location: location?.trim(),
        start: new Date(start),
        end: new Date(end),
        attendees,
        allDay,
        timeZone,
      },
    );

    const googleCalendars = availableCalendars;
    const calendars = toCalendars(googleCalendars);
    const calendar = googleCalendars.find((cal) => cal.id === calendarId);

    const createdEvent = transformGoogleEventToCalendarEvent(
      { ...createdGoogleEvent, calendarId },
      calendars,
      calendar?.accessRole || undefined,
    );
    return Response.json(createdEvent, { status: 201 });
  } catch (error) {
    log.error("failed to create event", { error });
    return Response.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PATCH /api/events - Update event in Google Calendar
export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(
    request,
    eventMutationSchema.merge(
      calendarEventUpdateSchema.extend({ timeZone: ianaTimeZone.optional() }),
    ),
  );
  if (parsed.error) return parsed.error;
  const { eventId, calendarId, ...data } = parsed.data;

  try {
    if (!(await userCanAccessCalendar(session.user.id, calendarId))) {
      return Response.json(
        { error: "Calendar is unavailable" },
        { status: 400 },
      );
    }
    const updatedGoogleEvent = await updateGoogleEvent(
      session.user.id,
      calendarId,
      eventId,
      {
        summary: data.summary?.trim(),
        description: data.description?.trim(),
        location: data.location?.trim(),
        start: data.start ? new Date(data.start) : undefined,
        end: data.end ? new Date(data.end) : undefined,
        attendees: data.attendees,
        allDay: data.allDay,
        timeZone: data.timeZone,
      },
    );

    const googleCalendars = await fetchGoogleCalendars(session.user.id);
    const calendars = toCalendars(googleCalendars);
    const calendar = googleCalendars.find((cal) => cal.id === calendarId);

    const updatedEvent = transformGoogleEventToCalendarEvent(
      { ...updatedGoogleEvent, calendarId },
      calendars,
      calendar?.accessRole || undefined,
    );
    return Response.json(updatedEvent);
  } catch (error) {
    log.error("failed to update event", { error });
    return Response.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/events - Delete event from Google Calendar
export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("id");
  const calendarId = searchParams.get("calendarId");
  if (!eventId)
    return Response.json({ error: "Event ID is required" }, { status: 400 });
  if (!calendarId)
    return Response.json({ error: "Calendar ID is required" }, { status: 400 });

  try {
    if (!(await userCanAccessCalendar(session.user.id, calendarId))) {
      return Response.json(
        { error: "Calendar is unavailable" },
        { status: 400 },
      );
    }
    await deleteGoogleEvent(session.user.id, calendarId, eventId);
    return Response.json({ success: true });
  } catch (error) {
    log.error("failed to delete event", { error });
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
