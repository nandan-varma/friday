import { NextResponse } from "next/server"
import { getUserFromCookie } from "@/lib/auth"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookie()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { input } = await request.json()
    const today = new Date().toISOString().split("T")[0]

    const result = await generateObject({
      model: openai("gpt-4o"),
      system: `You are a calendar event parser. Parse natural language input into structured calendar event data.
               Today's date is ${today}.
               If the input doesn't specify a time, use reasonable defaults.
               If the input mentions "all day", set isAllDay to true.`,
      prompt: input,
      schema: z.object({
        title: z.string().describe("Event title"),
        description: z.string().optional().describe("Event description if provided"),
        location: z.string().optional().describe("Event location if provided"),
        date: z.string().describe("Event date in YYYY-MM-DD format"),
        startTime: z.string().describe("Event start time in HH:MM format"),
        endTime: z.string().describe("Event end time in HH:MM format"),
        isAllDay: z.boolean().default(false).describe("Whether this is an all-day event")
      }),
    })

    return result.toJsonResponse()
  } catch (error) {
    console.error("Error parsing event:", error)
    return NextResponse.json({ error: "Failed to parse event" }, { status: 500 })
  }
}
