import { db } from "@/lib/db"
import { user } from "@/lib/db/schema/auth"
import { userSettings } from "@/lib/db/schema/calendar"
import { eq } from "drizzle-orm"

export interface UserProfile {
  id: string
  name: string | null
  email: string
}

export interface userSettingsData {
  timezone: string | null
  notificationsEnabled: boolean | null
  aiSuggestionsEnabled: boolean | null
  reminderTime: number | null
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const [currentUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, userId))

    return currentUser || null
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw new Error("Failed to fetch user profile")
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string }
): Promise<UserProfile> {
  try {
    const [updatedUser] = await db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
      })

    return updatedUser
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update user profile")
  }
}

export async function getuserSettings(userId: string): Promise<userSettingsData | null> {
  try {
    const [settings] = await db
      .select({
        timezone: userSettings.timezone,
        notificationsEnabled: userSettings.notificationsEnabled,
        aiSuggestionsEnabled: userSettings.aiSuggestionsEnabled,
        reminderTime: userSettings.reminderTime,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .$withCache()

    return settings || null
  } catch (error) {
    console.error("Error fetching user settings:", error)
    throw new Error("Failed to fetch user settings")
  }
}

export async function updateuserSettings(
  userId: string,
  data: Partial<userSettingsData>
): Promise<userSettingsData> {
  try {
    // Check if settings exist
    const existingSettings = await getuserSettings(userId)

    if (existingSettings) {      // Update existing settings
      const [updatedSettings] = await db
        .update(userSettings)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId))
        .returning({
          timezone: userSettings.timezone,
          notificationsEnabled: userSettings.notificationsEnabled,
          aiSuggestionsEnabled: userSettings.aiSuggestionsEnabled,
          reminderTime: userSettings.reminderTime,
        })

      return updatedSettings
    } else {      // Create new settings
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId,
          timezone: data.timezone || "UTC",
          notificationsEnabled: data.notificationsEnabled ?? true,
          aiSuggestionsEnabled: data.aiSuggestionsEnabled ?? true,
          reminderTime: data.reminderTime ?? 30,
        })
        .returning({
          timezone: userSettings.timezone,
          notificationsEnabled: userSettings.notificationsEnabled,
          aiSuggestionsEnabled: userSettings.aiSuggestionsEnabled,
          reminderTime: userSettings.reminderTime,
        })

      return newSettings
    }
  } catch (error) {
    console.error("Error updating user settings:", error)
    throw new Error("Failed to update user settings")
  }
}

export async function createDefaultuserSettings(userId: string): Promise<void> {
  try {
    await db.insert(userSettings).values({
      userId,
      timezone: "UTC",
      notificationsEnabled: true,
      aiSuggestionsEnabled: true,
      reminderTime: 30,
    })
  } catch (error) {
    console.error("Error creating default user settings:", error)
    throw new Error("Failed to create default user settings")
  }
}