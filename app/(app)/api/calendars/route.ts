import { db } from "@/db";
import { calendar, type NewCalendar } from "@/db/schema/calendar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calendars = await db.query.calendar.findMany({
      where: eq(calendar.userId, session.user.id),
      orderBy: (calendar, { asc }) => [asc(calendar.sortOrder), asc(calendar.createdAt)],
    });

    return Response.json(calendars);
  } catch (error) {
    console.error("Failed to fetch calendars:", error);
    return Response.json({ error: "Failed to fetch calendars" }, { status: 500 });
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
    const { name, description, color, isDefault, isVisible } = body;

    if (!name?.trim()) {
      return Response.json({ error: "Calendar name is required" }, { status: 400 });
    }

    const newCalendar: NewCalendar = {
      id: nanoid(),
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
      color: color || "#3b82f6",
      isDefault: isDefault || false,
      isVisible: isVisible ?? true,
      sortOrder: 0,
    };

    const [created] = await db.insert(calendar).values(newCalendar).returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create calendar:", error);
    return Response.json({ error: "Failed to create calendar" }, { status: 500 });
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
      return Response.json({ error: "Calendar ID is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(calendar)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(calendar.id, id), eq(calendar.userId, session.user.id)))
      .returning();

    if (!updated) {
      return Response.json({ error: "Calendar not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Failed to update calendar:", error);
    return Response.json({ error: "Failed to update calendar" }, { status: 500 });
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
      return Response.json({ error: "Calendar ID is required" }, { status: 400 });
    }

    await db
      .delete(calendar)
      .where(and(eq(calendar.id, id), eq(calendar.userId, session.user.id)));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete calendar:", error);
    return Response.json({ error: "Failed to delete calendar" }, { status: 500 });
  }
}
