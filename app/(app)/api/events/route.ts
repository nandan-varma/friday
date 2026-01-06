import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  fetchGoogleEvents,
  fetchAllSelectedCalendarEvents,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} from "@/lib/google-calendar";
import { getIntegration } from "@/lib/google-oauth";

// GET /api/events - Fetch events from Google Calendar
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Google Calendar is connected
    const integration = await getIntegration(session.user.id);
    
    if (!integration) {
      return Response.json({ error: "Google Calendar not connected" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const calendarId = searchParams.get("calendarId");

    let events;

    if (calendarId) {
      // Fetch from specific calendar
      events = await fetchGoogleEvents(session.user.id, calendarId, {
        timeMin: start ? new Date(start) : undefined,
        timeMax: end ? new Date(end) : undefined,
      });
    } else {
      // Fetch from all selected calendars
      events = await fetchAllSelectedCalendarEvents(session.user.id, {
        timeMin: start ? new Date(start) : undefined,
        timeMax: end ? new Date(end) : undefined,
      });
    }

    return Response.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST /api/events - Create event in Google Calendar
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      calendarId,
      summary,
      description,
      location,
      start,
      end,
      attendees,
    } = body;

    if (!summary?.trim()) {
      return Response.json({ error: "Event title is required" }, { status: 400 });
    }

    if (!calendarId) {
      return Response.json({ error: "Calendar ID is required" }, { status: 400 });
    }

    if (!start || !end) {
      return Response.json({ error: "Start and end times are required" }, { status: 400 });
    }

    const created = await createGoogleEvent(session.user.id, calendarId, {
      summary: summary.trim(),
      description: description?.trim(),
      location: location?.trim(),
      start: new Date(start),
      end: new Date(end),
      attendees: attendees || [],
    });

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return Response.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PATCH /api/events - Update event in Google Calendar
export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, calendarId, ...updates } = body;

    if (!eventId) {
      return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (!calendarId) {
      return Response.json({ error: "Calendar ID is required" }, { status: 400 });
    }

    // Convert date strings to Date objects if present
    const updateData: any = {};
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.start) updateData.start = new Date(updates.start);
    if (updates.end) updateData.end = new Date(updates.end);
    if (updates.attendees) updateData.attendees = updates.attendees;

    const updated = await updateGoogleEvent(
      session.user.id,
      calendarId,
      eventId,
      updateData
    );

    return Response.json(updated);
  } catch (error) {
    console.error("Failed to update event:", error);
    return Response.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/events - Delete event from Google Calendar
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("id");
    const calendarId = searchParams.get("calendarId");

    if (!eventId) {
      return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (!calendarId) {
      return Response.json({ error: "Calendar ID is required" }, { status: 400 });
    }

    await deleteGoogleEvent(session.user.id, calendarId, eventId);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
