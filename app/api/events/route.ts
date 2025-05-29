import { NextResponse } from "next/server"
import { getUserFromCookie } from "@/lib/auth"
import { EventService } from "@/services/eventService"

export async function GET(request: Request) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    const filters = {
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    }
    
    const userEvents = await EventService.getEvents(user.id, filters)

    return NextResponse.json(userEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, location, startTime, endTime, isAllDay, recurrence } = body

    const newEvent = await EventService.createEvent(user.id, {
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
      recurrence
    })

    return NextResponse.json(newEvent)
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
