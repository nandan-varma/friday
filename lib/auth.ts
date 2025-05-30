import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { compare, hash } from "bcrypt"
import { cookies } from "next/headers"

export async function getUserFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return null
  }

  try {
    // In a real app, you'd verify the token and extract the user ID
    // This is a simplified version
    const userId = Number.parseInt(token.value)
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    console.error("Error getting user from cookie:", error)
    return null
  }
}

export async function signUp(email: string, password: string, name?: string) {
  try {
    const hashedPassword = await hash(password, 10)

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name: name || null,
      })
      .returning({ id: users.id })

    // Automatically sign in the user after signup
    const cookieStore = await cookies()
    cookieStore.set("auth-token", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax"
    })

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Error signing up:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" }
    }

    // Set a cookie with the user ID
    // In a real app, you'd use a proper JWT or session
    const cookieStore = await cookies()
    cookieStore.set("auth-token", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax"
    })

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Error signing in:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
