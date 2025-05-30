import { NextRequest, NextResponse } from "next/server"
import { getUserProfile, updateUserProfile } from "@/services/profileService"
import { getUserFromCookie } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromCookie()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)
    
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
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
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const updatedProfile = await updateUserProfile(user.id, {
      name,
      email,
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
