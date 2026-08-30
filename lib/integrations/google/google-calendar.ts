import { google, calendar_v3 } from "googleapis";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { account } from "@/db/schema/auth";
import { calendarPreference } from "@/db/schema/calendar";
import type { Calendar, CalendarEvent } from "@/types/calendar";
import { createLogger } from "@/lib/logger";

const log = createLogger("google-calendar");

export type GoogleCalendar = calendar_v3.Schema$CalendarListEntry;
export type GoogleEvent = calendar_v3.Schema$Event;

// Google account linked via Better Auth (`socialProviders.google`). OAuth
// tokens and refresh live in Better Auth's own `account` table.
export async function getGoogleAccount(userId: string) {
  const [row] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
    .limit(1);
  return row ?? null;
}

export async function isGoogleCalendarConnected(userId: string): Promise<boolean> {
  const googleAccount = await getGoogleAccount(userId);
  return !!googleAccount?.scope?.includes("https://www.googleapis.com/auth/calendar");
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
  calendarAccessRole?: string
): CalendarEvent {
  const calendar = calendars.find((c) => c.id === event.calendarId);
  const startDate = event.start?.dateTime
    ? new Date(event.start.dateTime)
    : event.start?.date
      ? new Date(event.start.date)
      : new Date();
  const endDate = event.end?.dateTime
    ? new Date(event.end.dateTime)
    : event.end?.date
      ? new Date(event.end.date)
      : new Date();

  const hasWriteAccess = calendarAccessRole === "owner" || calendarAccessRole === "writer";
  const isOrganizer = event.organizer?.self === true;
  const editable = hasWriteAccess && (isOrganizer || !event.organizer);

  return {
    id: event.id!,
    title: event.summary || "Untitled Event",
    description: event.description || undefined,
    start: startDate,
    end: endDate,
    calendarId: event.calendarId,
    color: calendar?.color || "blue",
    location: event.location || undefined,
    attendees: event.attendees?.map((a) => a.email!) || undefined,
    htmlLink: event.htmlLink || undefined,
    editable,
  };
}

export async function fetchGoogleCalendars(userId: string): Promise<GoogleCalendar[]> {
  const calendar = await getCalendarClient(userId);
  const response = await calendar.calendarList.list({
    showHidden: false,
    showDeleted: false,
  });
  const items = response.data.items || [];
  log.debug("fetched calendars", { userId, count: items.length });
  return items;
}

export async function fetchGoogleEvents(
  userId: string,
  calendarId: string,
  options?: { timeMin?: Date; timeMax?: Date; maxResults?: number }
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

export async function getSelectedCalendarIds(userId: string): Promise<string[]> {
  const [pref] = await db
    .select()
    .from(calendarPreference)
    .where(eq(calendarPreference.userId, userId))
    .limit(1);
  return pref?.selectedCalendarIds ? JSON.parse(pref.selectedCalendarIds) : ["primary"];
}

export async function fetchAllSelectedCalendarEvents(
  userId: string,
  options?: { timeMin?: Date; timeMax?: Date }
): Promise<Array<GoogleEvent & { calendarId: string; accessRole?: string }>> {
  const [calendarIds, googleCalendars] = await Promise.all([
    getSelectedCalendarIds(userId),
    fetchGoogleCalendars(userId),
  ]);
  const calendarAccessRoles = new Map(googleCalendars.map((cal) => [cal.id!, cal.accessRole]));

  const allEvents: Array<GoogleEvent & { calendarId: string; accessRole?: string }> = [];

  for (const calendarId of calendarIds) {
    try {
      const events = await fetchGoogleEvents(userId, calendarId, options);
      allEvents.push(
        ...events.map((event) => ({
          ...event,
          calendarId,
          accessRole: calendarAccessRoles.get(calendarId) || undefined,
        }))
      );
    } catch (error) {
      log.error("failed to fetch events for calendar", { userId, calendarId, error });
    }
  }

  log.info("fetched all selected calendar events", { userId, calendars: calendarIds.length, events: allEvents.length });
  return allEvents;
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
  }
): Promise<GoogleEvent> {
  const calendar = await getCalendarClient(userId);
  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.start.toISOString(), timeZone: "UTC" },
      end: { dateTime: event.end.toISOString(), timeZone: "UTC" },
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
  }
): Promise<GoogleEvent> {
  const calendar = await getCalendarClient(userId);

  const requestBody: calendar_v3.Schema$Event = {};
  if (updates.summary !== undefined) requestBody.summary = updates.summary;
  if (updates.description !== undefined) requestBody.description = updates.description;
  if (updates.location !== undefined) requestBody.location = updates.location;
  if (updates.start) requestBody.start = { dateTime: updates.start.toISOString(), timeZone: "UTC" };
  if (updates.end) requestBody.end = { dateTime: updates.end.toISOString(), timeZone: "UTC" };
  if (updates.attendees) requestBody.attendees = updates.attendees.map((email) => ({ email }));

  const response = await calendar.events.patch({ calendarId, eventId, requestBody });
  log.info("updated event", { userId, calendarId, eventId });
  return response.data;
}

export async function deleteGoogleEvent(userId: string, calendarId: string, eventId: string): Promise<void> {
  const calendar = await getCalendarClient(userId);
  await calendar.events.delete({ calendarId, eventId });
  log.info("deleted event", { userId, calendarId, eventId });
}

export async function updateSelectedCalendars(userId: string, calendarIds: string[]): Promise<void> {
  await db
    .insert(calendarPreference)
    .values({
      userId,
      selectedCalendarIds: JSON.stringify(calendarIds),
    })
    .onConflictDoUpdate({
      target: calendarPreference.userId,
      set: { selectedCalendarIds: JSON.stringify(calendarIds), updatedAt: new Date() },
    });
  log.debug("updated selected calendars", { userId, count: calendarIds.length });
}
