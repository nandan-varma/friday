import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  fetchGoogleEvents,
  fetchAllSelectedCalendarEvents,
  fetchGoogleCalendars,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
  transformGoogleEventToCalendarEvent,
} from "@/lib/google-calendar";
import { getIntegration } from "@/lib/google-oauth";
import type { Calendar } from "@/types/calendar";
import { z } from "zod";

const CALENDAR_COLORS = ["blue", "amber", "green", "pink", "purple", "red", "indigo", "cyan"] as const;

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

      // Validate query params
      const querySchema = z.object({
        start: z.string().optional().refine(val => val === undefined || !isNaN(Date.parse(val)), 'Invalid start date'),
        end: z.string().optional().refine(val => val === undefined || !isNaN(Date.parse(val)), 'Invalid end date'),
        calendarId: z.string().nullable().optional(),
      });

      const queryValidation = querySchema.safeParse({ start, end, calendarId });

      if (!queryValidation.success) {
        return Response.json(
        { error: 'Validation failed', details: queryValidation.error.issues },
        { status: 400 }
        );
      }

    // Fetch calendars for transformation
    const googleCalendars = await fetchGoogleCalendars(session.user.id);
    const calendars: Calendar[] = googleCalendars.map((cal, index) => ({
      id: cal.id!,
      name: cal.summary || "Untitled Calendar",
      color: CALENDAR_COLORS[index % CALENDAR_COLORS.length],
      checked: true, // We'll handle this later if needed
    }));

    let googleEvents;

    if (calendarId) {
      // Fetch from specific calendar
      googleEvents = await fetchGoogleEvents(session.user.id, calendarId, {
        timeMin: start ? new Date(start) : undefined,
        timeMax: end ? new Date(end) : undefined,
      });
      // Add calendarId to each event
      googleEvents = googleEvents.map(event => ({ ...event, calendarId }));
    } else {
      // Fetch from all selected calendars
      googleEvents = await fetchAllSelectedCalendarEvents(session.user.id, {
        timeMin: start ? new Date(start) : undefined,
        timeMax: end ? new Date(end) : undefined,
      });
    }

    // Transform to CalendarEvent[]
    const events = googleEvents.map(event => transformGoogleEventToCalendarEvent(event, calendars));

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

    // Define Zod schema for validation
    const createEventSchema = z.object({
      calendarId: z.string().min(1, 'Calendar ID is required'),
      summary: z.string().min(1, 'Event title is required').trim(),
      description: z.string().optional(),
      location: z.string().optional(),
      start: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
      end: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
      attendees: z.array(z.object({ email: z.string().email() })).optional().default([]),
    });

    const validationResult = createEventSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { calendarId, summary, description, location, start, end, attendees } = validationResult.data;

    const createdGoogleEvent = await createGoogleEvent(session.user.id, calendarId, {
      summary,
      description: description?.trim(),
      location: location?.trim(),
      start: new Date(start),
      end: new Date(end),
      attendees: attendees?.map(a => a.email),
    });

    // Transform to CalendarEvent
    const googleCalendars = await fetchGoogleCalendars(session.user.id);
    const calendars: Calendar[] = googleCalendars.map((cal, index) => ({
      id: cal.id!,
      name: cal.summary || "Untitled Calendar",
      color: CALENDAR_COLORS[index % CALENDAR_COLORS.length],
      checked: true,
    }));

    const createdEvent = transformGoogleEventToCalendarEvent(
      { ...createdGoogleEvent, calendarId },
      calendars
    );

    return Response.json(createdEvent, { status: 201 });
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

    // Define Zod schema for update validation
    const updateEventSchema = z.object({
      summary: z.string().optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      start: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date').optional(),
      end: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date').optional(),
      attendees: z.array(z.object({ email: z.string().email() })).optional(),
    });

    const validationResult = updateEventSchema.safeParse(updates);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Convert validated date strings to Date objects
    const updateData: Partial<{ summary?: string; description?: string; location?: string; start?: Date; end?: Date; attendees?: string[] }> = {};
    if (validationResult.data.summary !== undefined) updateData.summary = validationResult.data.summary?.trim();
    if (validationResult.data.description !== undefined) updateData.description = validationResult.data.description?.trim();
    if (validationResult.data.location !== undefined) updateData.location = validationResult.data.location?.trim();
    if (validationResult.data.start) updateData.start = new Date(validationResult.data.start);
    if (validationResult.data.end) updateData.end = new Date(validationResult.data.end);
    if (validationResult.data.attendees) updateData.attendees = validationResult.data.attendees.map(a => a.email);

    const updatedGoogleEvent = await updateGoogleEvent(
      session.user.id,
      calendarId,
      eventId,
      updateData
    );

    // Transform to CalendarEvent
    const googleCalendars = await fetchGoogleCalendars(session.user.id);
    const calendars: Calendar[] = googleCalendars.map((cal, index) => ({
      id: cal.id!,
      name: cal.summary || "Untitled Calendar",
      color: CALENDAR_COLORS[index % CALENDAR_COLORS.length],
      checked: true,
    }));

    const updatedEvent = transformGoogleEventToCalendarEvent(
      { ...updatedGoogleEvent, calendarId },
      calendars
    );

    return Response.json(updatedEvent);
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
