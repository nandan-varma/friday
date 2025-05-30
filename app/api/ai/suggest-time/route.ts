import { NextResponse } from "next/server"
import { getUserFromCookie } from "@/lib/auth"
import { EventService } from "@/services/eventService"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { duration, preferences, dateRange } = await request.json()

    // Get user's existing events
    const userEvents = await EventService.getAllEventsInRange(
      user.id,
      new Date(dateRange.start),
      new Date(dateRange.end)
    )

    const { object: suggestions } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        suggestions: z.array(
          z.object({
            date: z.string(),
            startTime: z.string(),
            endTime: z.string(),
            reason: z.string(),
          })
        ),
      }),
      prompt: `You are a smart calendar assistant. Suggest optimal meeting times based on existing calendar events and preferences.
               Consider work hours (9 AM - 5 PM), avoid scheduling over existing events, and respect user preferences.
               
               Find ${duration} minute time slots between ${dateRange.start} and ${dateRange.end}.
               Existing events: ${userEvents.map(event => `${event.title} on ${event.startTime.toISOString()}`).join(",\n")}.
               Preferences: ${preferences}`,
    });

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error suggesting times:", error)
    return NextResponse.json({ error: "Failed to suggest times" }, { status: 500 })
  }
}
