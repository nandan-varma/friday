import { NextRequest, NextResponse } from "next/server"
import { getUserSettings, updateUserSettings } from "@/services/profileService"
import { getUserFromCookie } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromCookie()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await getUserSettings(user.id)
    
    return NextResponse.json(settings || {
      timezone: "UTC",
      notificationsEnabled: true,
      aiSuggestionsEnabled: true,
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromCookie()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { timezone, notificationsEnabled, aiSuggestionsEnabled } = body

    const updatedSettings = await updateUserSettings(user.id, {
      timezone,
      notificationsEnabled,
      aiSuggestionsEnabled,
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
