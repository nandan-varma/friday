import { google, calendar_v3 } from "googleapis";
import { getAuthenticatedClient, getIntegration } from "./google-oauth";
import { db } from "@/db";
import { googleCalendarIntegration } from "@/db/schema/calendar";
import { eq } from "drizzle-orm";

export type GoogleCalendar = calendar_v3.Schema$CalendarListEntry;
export type GoogleEvent = calendar_v3.Schema$Event;

// Get Google Calendar API client
async function getCalendarClient(userId: string) {
  const oauth2Client = await getAuthenticatedClient(userId);
  return google.calendar({ version: "v3", auth: oauth2Client });
}

// Fetch user's calendar list from Google
export async function fetchGoogleCalendars(userId: string): Promise<GoogleCalendar[]> {
  const calendar = await getCalendarClient(userId);

  const response = await calendar.calendarList.list({
    showHidden: false,
    showDeleted: false,
  });

  return response.data.items || [];
}

// Fetch events from a specific calendar
export async function fetchGoogleEvents(
  userId: string,
  calendarId: string,
  options?: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
  }
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

  return response.data.items || [];
}

// Fetch events from all selected calendars
export async function fetchAllSelectedCalendarEvents(
  userId: string,
  options?: {
    timeMin?: Date;
    timeMax?: Date;
  }
): Promise<Array<GoogleEvent & { calendarId: string }>> {
  const integration = await getIntegration(userId);

  if (!integration) {
    throw new Error("No Google Calendar integration found");
  }

  // If no calendars selected, fetch from primary calendar
  const calendarIds = integration.selectedCalendarIds
    ? JSON.parse(integration.selectedCalendarIds)
    : ["primary"];

  const allEvents: Array<GoogleEvent & { calendarId: string }> = [];

  // Fetch events from each calendar
  for (const calendarId of calendarIds) {
    try {
      const events = await fetchGoogleEvents(userId, calendarId, options);
      // Add calendarId to each event for reference
      allEvents.push(
        ...events.map((event) => ({
          ...event,
          calendarId,
        }))
      );
    } catch (error) {
      console.error(`Failed to fetch events from calendar ${calendarId}:`, error);
      // Continue with other calendars even if one fails
    }
  }

  return allEvents;
}

// Create an event in Google Calendar
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
      start: {
        dateTime: event.start.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: "UTC",
      },
      attendees: event.attendees?.map((email) => ({ email })),
    },
  });

  return response.data;
}

// Update an event in Google Calendar
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

  if (updates.start) {
    requestBody.start = {
      dateTime: updates.start.toISOString(),
      timeZone: "UTC",
    };
  }

  if (updates.end) {
    requestBody.end = {
      dateTime: updates.end.toISOString(),
      timeZone: "UTC",
    };
  }

  if (updates.attendees) {
    requestBody.attendees = updates.attendees.map((email) => ({ email }));
  }

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody,
  });

  return response.data;
}

// Delete an event from Google Calendar
export async function deleteGoogleEvent(
  userId: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const calendar = await getCalendarClient(userId);

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

// Update selected calendar IDs for sync
export async function updateSelectedCalendars(
  userId: string,
  calendarIds: string[]
): Promise<void> {
  await db
    .update(googleCalendarIntegration)
    .set({
      selectedCalendarIds: JSON.stringify(calendarIds),
      updatedAt: new Date(),
    })
    .where(eq(googleCalendarIntegration.userId, userId));
}

// Update last sync timestamp
export async function updateLastSyncAt(userId: string): Promise<void> {
  await db
    .update(googleCalendarIntegration)
    .set({
      lastSyncAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(googleCalendarIntegration.userId, userId));
}

// Get sync status
export async function getSyncStatus(userId: string) {
  const integration = await getIntegration(userId);

  if (!integration) {
    return null;
  }

  return {
    lastSyncAt: integration.lastSyncAt,
    selectedCalendarIds: integration.selectedCalendarIds
      ? JSON.parse(integration.selectedCalendarIds)
      : [],
  };
}
