import { db } from "@/lib/db";
import { user, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface UserSettingsData {
  timezone: string | null;
  notificationsEnabled: boolean | null;
  aiSuggestionsEnabled: boolean | null;
  reminderTime: number | null;
}

/**
 * Get user profile information
 * @param userId - The user ID to fetch profile for
 * @returns User profile data or null if not found
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const [currentUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, userId));

    return currentUser || null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

/**
 * Update user profile information
 * @param userId - The user ID to update
 * @param data - The profile data to update
 * @returns Updated user profile
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string },
): Promise<UserProfile> {
  try {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    const [updatedUser] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
      });

    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
}

/**
 * Get user settings
 * @param userId - The user ID to fetch settings for
 * @returns User settings data or null if not found
 */
export async function getUserSettings(
  userId: string,
): Promise<UserSettingsData | null> {
  try {
    const [settings] = await db
      .select({
        timezone: userSettings.timezone,
        notificationsEnabled: userSettings.notificationsEnabled,
        aiSuggestionsEnabled: userSettings.aiSuggestionsEnabled,
        reminderTime: userSettings.reminderTime,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    return settings || null;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw new Error("Failed to fetch user settings");
  }
}

/**
 * Update user settings
 * @param userId - The user ID to update settings for
 * @param data - The settings data to update
 * @returns Updated user settings
 */
export async function updateUserSettings(
  userId: string,
  data: Partial<UserSettingsData>,
): Promise<UserSettingsData> {
  try {
    // Use transaction for atomicity
    return await db.transaction(async (tx) => {
      // Check if settings exist
      const existingSettings = await tx
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      if (existingSettings.length > 0) {
        // Update existing settings
        const [updatedSettings] = await tx
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
          });

        return updatedSettings;
      } else {
        // Create new settings
        const [newSettings] = await tx
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
          });

        return newSettings;
      }
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw new Error("Failed to update user settings");
  }
}

/**
 * Create default user settings for a new user
 * @param userId - The user ID to create default settings for
 */
export async function createDefaultUserSettings(userId: string): Promise<void> {
  try {
    await db.insert(userSettings).values({
      userId,
      timezone: "UTC",
      notificationsEnabled: true,
      aiSuggestionsEnabled: true,
      reminderTime: 30,
    });
  } catch (error) {
    console.error("Error creating default user settings:", error);
    throw new Error("Failed to create default user settings");
  }
}
