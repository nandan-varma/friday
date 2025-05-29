import { NextResponse } from "next/server"
import { getUserFromCookie } from "@/lib/auth"
import { EventService } from "@/services/eventService"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { duration, preferences, dateRange } = await request.json()

    // Get user's existing events
    const userEvents = await EventService.getEventsInRange(
      user.id,
      new Date(dateRange.start),
      new Date(dateRange.end)
    )

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a smart calendar assistant. Suggest optimal meeting times based on existing calendar events and preferences.
               Consider work hours (9 AM - 5 PM), avoid scheduling over existing events, and respect user preferences.
               Return a JSON array of suggested time slots with these fields:
               - date (YYYY-MM-DD)
               - startTime (HH:MM)
               - endTime (HH:MM)
               - reason (why this time is good)`,
      prompt: `Find ${duration} minute time slots between ${dateRange.start} and ${dateRange.end}.
               Existing events: ${JSON.stringify(userEvents)}
               Preferences: ${preferences}`,
    })

    const suggestions = JSON.parse(text)
    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error suggesting times:", error)
    return NextResponse.json({ error: "Failed to suggest times" }, { status: 500 })
  }
}
