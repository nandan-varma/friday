import { NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const result = await signIn(email, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json({ success: true, userId: result.userId })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
