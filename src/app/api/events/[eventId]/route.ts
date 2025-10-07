import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EventService } from "@/lib/services/eventService";
import logger from "@/lib/logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const body = await request.json();
    const {
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
      recurrence,
    } = body;
    const userId = session.user.id;

    const eventData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: new Date(endTime) }),
      ...(isAllDay !== undefined && { isAllDay }),
      ...(recurrence !== undefined && { recurrence }),
    };

    const event = await EventService.saveEvent(userId, eventData, { eventId });

    return NextResponse.json({ event });
  } catch (error) {
    logger.error({ err: error }, "Error updating event");
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const userId = session.user.id;

    await EventService.deleteEvent(userId, eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, "Error deleting event");
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
