import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  fetchGoogleCalendars,
  fetchAllSelectedCalendarEvents,
  updateLastSyncAt,
  getSyncStatus,
} from "@/lib/google-calendar";
import { getIntegration } from "@/lib/google-oauth";

// POST /api/sync/google - Trigger manual sync
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if integration exists
    const integration = await getIntegration(session.user.id);

    if (!integration) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    // Parse request body for sync options
    const body = await req.json().catch(() => ({}));
    const { timeMin, timeMax } = body;

    // Fetch calendars from Google
    const calendars = await fetchGoogleCalendars(session.user.id);

    // Fetch events from selected calendars
    const events = await fetchAllSelectedCalendarEvents(session.user.id, {
      timeMin: timeMin ? new Date(timeMin) : undefined,
      timeMax: timeMax ? new Date(timeMax) : undefined,
    });

    // Update last sync timestamp
    await updateLastSyncAt(session.user.id);

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      stats: {
        calendarsFound: calendars.length,
        eventsFetched: events.length,
      },
      calendars: calendars.map((cal) => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        primary: cal.primary,
        accessRole: cal.accessRole,
      })),
      events: events.map((event) => ({
        id: event.id,
        calendarId: event.calendarId,
        summary: event.summary,
        description: event.description,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location,
        attendees: event.attendees?.map((a) => a.email),
        htmlLink: event.htmlLink,
      })),
    });
  } catch (error) {
    console.error("Error syncing Google Calendar:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync Google Calendar",
      },
      { status: 500 }
    );
  }
}

// GET /api/sync/google - Get sync status
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getSyncStatus(session.user.id);

    if (!status) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}
