import { NextResponse } from "next/server"
import { getUserFromCookie } from "@/lib/auth"
import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventId = Number.parseInt(params.id)
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.userId, user.id)),
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventId = Number.parseInt(params.id)
    const body = await request.json()

    const [updatedEvent] = await db
      .update(events)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, eventId), eq(events.userId, user.id)))
      .returning()

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventId = Number.parseInt(params.id)
    const [deletedEvent] = await db
      .delete(events)
      .where(and(eq(events.id, eventId), eq(events.userId, user.id)))
      .returning()

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
