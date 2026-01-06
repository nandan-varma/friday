import { db } from "@/db";
import { event, type NewEvent } from "@/db/schema/calendar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const calendarId = searchParams.get("calendarId");

    let query = db.query.event.findMany({
      where: eq(event.userId, session.user.id),
      orderBy: (event, { asc }) => [asc(event.start)],
    });

    // Apply filters if provided
    const filters: any[] = [eq(event.userId, session.user.id)];

    if (start) {
      filters.push(gte(event.start, new Date(start)));
    }

    if (end) {
      filters.push(lte(event.end, new Date(end)));
    }

    if (calendarId) {
      filters.push(eq(event.calendarId, calendarId));
    }

    const events = await db.query.event.findMany({
      where: and(...filters),
      orderBy: (event, { asc }) => [asc(event.start)],
    });

    return Response.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

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
      title,
      description,
      location,
      start,
      end,
      allDay,
      color,
      recurrence,
      reminders,
      attendees,
      videoConferenceUrl,
      status,
    } = body;

    if (!title?.trim()) {
      return Response.json({ error: "Event title is required" }, { status: 400 });
    }

    if (!calendarId) {
      return Response.json({ error: "Calendar ID is required" }, { status: 400 });
    }

    if (!start || !end) {
      return Response.json({ error: "Start and end times are required" }, { status: 400 });
    }

    const newEvent: NewEvent = {
      id: nanoid(),
      userId: session.user.id,
      calendarId,
      title: title.trim(),
      description: description?.trim() || null,
      location: location?.trim() || null,
      start: new Date(start),
      end: new Date(end),
      allDay: allDay || false,
      color: color || null,
      recurrence: recurrence || null,
      reminders: reminders ? JSON.stringify(reminders) : null,
      attendees: attendees ? JSON.stringify(attendees) : null,
      videoConferenceUrl: videoConferenceUrl?.trim() || null,
      status: status || "confirmed",
    };

    const [created] = await db.insert(event).values(newEvent).returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return Response.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Convert date strings to Date objects if present
    if (updates.start) updates.start = new Date(updates.start);
    if (updates.end) updates.end = new Date(updates.end);

    // Convert arrays to JSON strings if present
    if (updates.reminders) updates.reminders = JSON.stringify(updates.reminders);
    if (updates.attendees) updates.attendees = JSON.stringify(updates.attendees);

    const [updated] = await db
      .update(event)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(event.id, id), eq(event.userId, session.user.id)))
      .returning();

    if (!updated) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Failed to update event:", error);
    return Response.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    await db
      .delete(event)
      .where(and(eq(event.id, id), eq(event.userId, session.user.id)));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
