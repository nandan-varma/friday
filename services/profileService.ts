import { db } from "@/lib/db"
import { users, userSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export interface UserProfile {
  id: number
  name: string | null
  email: string
}

export interface UserSettingsData {
  timezone: string | null
  notificationsEnabled: boolean | null
  aiSuggestionsEnabled: boolean | null
  reminderTime: number | null
}

export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))

    return user || null
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw new Error("Failed to fetch user profile")
  }
}

export async function updateUserProfile(
  userId: number,
  data: { name?: string; email?: string }
): Promise<UserProfile> {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      })

    return updatedUser
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update user profile")
  }
}

export async function getUserSettings(userId: number): Promise<UserSettingsData | null> {
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

    return settings || null
  } catch (error) {
    console.error("Error fetching user settings:", error)
    throw new Error("Failed to fetch user settings")
  }
}

export async function updateUserSettings(
  userId: number,
  data: Partial<UserSettingsData>
): Promise<UserSettingsData> {
  try {
    // Check if settings exist
    const existingSettings = await getUserSettings(userId)

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

export async function createDefaultUserSettings(userId: number): Promise<void> {
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