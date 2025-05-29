import { NextResponse } from "next/server"
import { getUserFromCookie } from "@/lib/auth"
import { EventService } from "@/services/eventService"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventId = Number.parseInt(params.id)
    const event = await EventService.getEventById(eventId, user.id)

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    if (error instanceof Error && error.message === "Event not found") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
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

    const updatedEvent = await EventService.updateEvent(eventId, user.id, body)

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    if (error instanceof Error && error.message === "Event not found") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
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
    const deletedEvent = await EventService.deleteEvent(eventId, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    if (error instanceof Error && error.message === "Event not found") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
