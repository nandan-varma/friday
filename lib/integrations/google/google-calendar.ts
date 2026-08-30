import { addDays, endOfDay, format, parseISO, subDays } from "date-fns";
import { and, eq } from "drizzle-orm";
import { type calendar_v3, google } from "googleapis";
import { z } from "zod";
import { db } from "@/db";
import { account } from "@/db/schema/auth";
import { calendarPreference } from "@/db/schema/calendar";
import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";
import type { Calendar, CalendarEvent } from "@/types/calendar";

const log = createLogger("google-calendar");

export type GoogleCalendar = calendar_v3.Schema$CalendarListEntry;
export type GoogleEvent = calendar_v3.Schema$Event;

const selectedCalendarIdsSchema = z.array(z.string().min(1)).max(100);

// Google account linked via Better Auth (`socialProviders.google`). OAuth
// tokens and refresh live in Better Auth's own `account` table.
async function getGoogleAccount(userId: string) {
  const [row] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
    .limit(1);
  return row ?? null;
}

export async function isGoogleCalendarConnected(
  userId: string,
): Promise<boolean> {
  const googleAccount = await getGoogleAccount(userId);
  return !!googleAccount?.scope?.includes(
    "https://www.googleapis.com/auth/calendar",
  );
}

async function getCalendarClient(userId: string) {
  const googleAccount = await getGoogleAccount(userId);
  if (!googleAccount) {
    log.warn("no linked google account", { userId });
    throw new Error("Google account not connected");
  }

  const { accessToken } = await auth.api.getAccessToken({
    body: { accountId: googleAccount.id, userId },
  });
  log.debug("access token acquired", { userId, accountId: googleAccount.id });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

// Transform GoogleEvent to CalendarEvent
export function transformGoogleEventToCalendarEvent(
  event: GoogleEvent & { calendarId: string },
  calendars: Calendar[],
  calendarAccessRole?: string,
): CalendarEvent {
  if (!event.id) {
    throw new Error("Google Calendar returned an event without an ID");
  }
  const calendar = calendars.find((c) => c.id === event.calendarId);
  const allDay = !event.start?.dateTime && !!event.start?.date;

  let startDate: Date;
  let endDate: Date;
  if (allDay) {
    // Google represents all-day dates as plain "YYYY-MM-DD" calendar dates,
    // not instants - `parseISO` (unlike the native `Date` constructor)
    // parses a date-only string as local midnight rather than UTC midnight,
    // which is what keeps a same-day all-day event from rendering as the
    // previous day west of UTC.
    const allDayStart = event.start?.date;
    if (!allDayStart) {
      throw new Error(
        "Google Calendar returned an all-day event without a start date",
      );
    }
    startDate = parseISO(allDayStart);
    // Google's all-day `end.date` is exclusive (the day *after* the last
    // day of the event). Represent it internally as inclusive - the last
    // instant of the last day - so duration math elsewhere in the app
    // (which assumes `end > start`) works the same as for timed events.
    const exclusiveEnd = event.end?.date
      ? parseISO(event.end.date)
      : addDays(startDate, 1);
    endDate = endOfDay(subDays(exclusiveEnd, 1));
    if (endDate < startDate) endDate = endOfDay(startDate);
  } else {
    startDate = event.start?.dateTime
      ? new Date(event.start.dateTime)
      : new Date();
    endDate = event.end?.dateTime ? new Date(event.end.dateTime) : new Date();
  }

  const hasWriteAccess =
    calendarAccessRole === "owner" || calendarAccessRole === "writer";
  const isOrganizer = event.organizer?.self === true;
  const editable = hasWriteAccess && (isOrganizer || !event.organizer);

  return {
    id: event.id,
    title: event.summary || "Untitled Event",
    description: event.description || undefined,
    start: startDate,
    end: endDate,
    calendarId: event.calendarId,
    color: calendar?.color || "blue",
    location: event.location || undefined,
    attendees:
      event.attendees?.flatMap((attendee) =>
        attendee.email ? [attendee.email] : [],
      ) || undefined,
    htmlLink: event.htmlLink || undefined,
    editable,
    allDay,
    recurringEventId: event.recurringEventId || undefined,
  };
}

export async function fetchGoogleCalendars(
  userId: string,
): Promise<GoogleCalendar[]> {
  const calendar = await getCalendarClient(userId);
  const response = await calendar.calendarList.list({
    showHidden: false,
    showDeleted: false,
  });
  const items = response.data.items || [];
  log.debug("fetched calendars", { userId, count: items.length });
  return items;
}

/** Returns a calendar only when it belongs to the authenticated user's Google account. */
export async function getGoogleCalendar(
  userId: string,
  calendarId: string,
): Promise<GoogleCalendar | null> {
  const calendars = await fetchGoogleCalendars(userId);
  return calendars.find((calendar) => calendar.id === calendarId) ?? null;
}

export async function fetchGoogleEvents(
  userId: string,
  calendarId: string,
  options?: { timeMin?: Date; timeMax?: Date; maxResults?: number },
): Promise<GoogleEvent[]> {
  const calendar = await getCalendarClient(userId);
  const response = await calendar.events.list({
    calendarId,
    timeMin: options?.timeMin?.toISOString(),
    timeMax: options?.timeMax?.toISOString(),
    maxResults: options?.maxResults || 250,
    singleEvents: true,
    orderBy: "startTime",
  });
  const items = response.data.items || [];
  log.debug("fetched events", { userId, calendarId, count: items.length });
  return items;
}

// Returns null when the user hasn't made an explicit selection yet (as
// opposed to an empty array, which means "user unchecked everything").
export async function getSelectedCalendarIds(
  userId: string,
): Promise<string[] | null> {
  const [pref] = await db
    .select()
    .from(calendarPreference)
    .where(eq(calendarPreference.userId, userId))
    .limit(1);
  if (!pref?.selectedCalendarIds) return null;

  try {
    return selectedCalendarIdsSchema.parse(
      JSON.parse(pref.selectedCalendarIds),
    );
  } catch (error) {
    log.warn("ignoring invalid calendar preference", { userId, error });
    return null;
  }
}

export async function fetchAllSelectedCalendarEvents(
  userId: string,
  options?: { timeMin?: Date; timeMax?: Date },
): Promise<Array<GoogleEvent & { calendarId: string; accessRole?: string }>> {
  const [preference, googleCalendars] = await Promise.all([
    getSelectedCalendarIds(userId),
    fetchGoogleCalendars(userId),
  ]);
  // No explicit preference yet - default to every calendar rather than the
  // literal string "primary", which never matches a real calendar id.
  const calendarIds =
    preference ??
    googleCalendars.flatMap((calendar) => (calendar.id ? [calendar.id] : []));
  const calendarAccessRoles = new Map(
    googleCalendars.flatMap((calendar) =>
      calendar.id ? [[calendar.id, calendar.accessRole] as const] : [],
    ),
  );

  const allEvents: Array<
    GoogleEvent & { calendarId: string; accessRole?: string }
  > = [];

  for (const calendarId of calendarIds) {
    try {
      const events = await fetchGoogleEvents(userId, calendarId, options);
      allEvents.push(
        ...events.map((event) => ({
          ...event,
          calendarId,
          accessRole: calendarAccessRoles.get(calendarId) || undefined,
        })),
      );
    } catch (error) {
      log.error("failed to fetch events for calendar", {
        userId,
        calendarId,
        error,
      });
    }
  }

  log.info("fetched all selected calendar events", {
    userId,
    calendars: calendarIds.length,
    events: allEvents.length,
  });
  return allEvents;
}

// Builds Google's start/end fields, translating our inclusive `end` back
// into Google's exclusive all-day `end.date` (see transformGoogleEventToCalendarEvent).
// `dateTime` always carries its own UTC offset (via `toISOString`), so the
// instant is correct regardless of `timeZone` - but tagging it with the
// zone it was actually created in (rather than a blanket "UTC") is what
// keeps recurring events expanding at the right local time across DST
// changes, and keeps Google's own UI honest about where it came from.
function toGoogleDateFields(
  start: Date,
  end: Date,
  allDay?: boolean,
  timeZone?: string,
): Pick<calendar_v3.Schema$Event, "start" | "end"> {
  if (allDay) {
    return {
      start: { date: format(start, "yyyy-MM-dd") },
      end: { date: format(addDays(end, 1), "yyyy-MM-dd") },
    };
  }
  return {
    start: { dateTime: start.toISOString(), timeZone: timeZone || "UTC" },
    end: { dateTime: end.toISOString(), timeZone: timeZone || "UTC" },
  };
}

export async function createGoogleEvent(
  userId: string,
  calendarId: string,
  event: {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
    attendees?: string[];
    allDay?: boolean;
    timeZone?: string;
  },
): Promise<GoogleEvent> {
  const calendar = await getCalendarClient(userId);
  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      ...toGoogleDateFields(
        event.start,
        event.end,
        event.allDay,
        event.timeZone,
      ),
      attendees: event.attendees?.map((email) => ({ email })),
    },
  });
  log.info("created event", { userId, calendarId, eventId: response.data.id });
  return response.data;
}

export async function updateGoogleEvent(
  userId: string,
  calendarId: string,
  eventId: string,
  updates: {
    summary?: string;
    description?: string;
    start?: Date;
    end?: Date;
    location?: string;
    attendees?: string[];
    allDay?: boolean;
    timeZone?: string;
  },
): Promise<GoogleEvent> {
  const calendar = await getCalendarClient(userId);

  const requestBody: calendar_v3.Schema$Event = {};
  if (updates.summary !== undefined) requestBody.summary = updates.summary;
  if (updates.description !== undefined)
    requestBody.description = updates.description;
  if (updates.location !== undefined) requestBody.location = updates.location;
  if (updates.start && updates.end) {
    Object.assign(
      requestBody,
      toGoogleDateFields(
        updates.start,
        updates.end,
        updates.allDay,
        updates.timeZone,
      ),
    );
  }
  if (updates.attendees !== undefined)
    requestBody.attendees = updates.attendees.map((email) => ({ email }));

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody,
  });
  log.info("updated event", { userId, calendarId, eventId });
  return response.data;
}

export async function deleteGoogleEvent(
  userId: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  const calendar = await getCalendarClient(userId);
  await calendar.events.delete({ calendarId, eventId });
  log.info("deleted event", { userId, calendarId, eventId });
}

export async function updateSelectedCalendars(
  userId: string,
  calendarIds: string[],
): Promise<void> {
  await db
    .insert(calendarPreference)
    .values({
      userId,
      selectedCalendarIds: JSON.stringify(calendarIds),
    })
    .onConflictDoUpdate({
      target: calendarPreference.userId,
      set: {
        selectedCalendarIds: JSON.stringify(calendarIds),
        updatedAt: new Date(),
      },
    });
  log.debug("updated selected calendars", {
    userId,
    count: calendarIds.length,
  });
}
