import { NextResponse } from "next/server"
import { signUp } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    const result = await signUp(email, password, name)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: result.userId })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
