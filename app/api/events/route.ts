import { NextResponse } from "next/server"
import { getUserFromCookie } from "@/lib/auth"
import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    const filters = [eq(events.userId, user.id)]
    
    if (startDate) {
      filters.push(gte(events.startTime, new Date(startDate)))
    }
    
    if (endDate) {
      filters.push(lte(events.endTime, new Date(endDate)))
    }
    
    const query = db
      .select()
      .from(events)
      .where(and(...filters))

    const userEvents = await query

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

    const [newEvent] = await db
      .insert(events)
      .values({
        userId: user.id,
        title,
        description: description || null,
        location: location || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isAllDay: isAllDay || false,
        recurrence: recurrence || "none",
      })
      .returning()

    return NextResponse.json(newEvent)
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
