import { auth } from "@/lib/auth"
import { EventService } from "@/services/eventService"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const events = await EventService.getAllUpcomingEvents(
      session.user.id,
      days,
      limit
    )

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming events" },
      { status: 500 }
    )
  }
}