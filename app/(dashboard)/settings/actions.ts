'use server'

import { revalidatePath } from 'next/cache'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { 
  getUserProfile, 
  updateUserProfile, 
  getuserSettings, 
  updateuserSettings,
  type UserProfile,
  type userSettingsData 
} from '@/services/profileService'

export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Update user profile information
 */
export async function updateUserProfileAction(data: { 
  name: string
  email: string 
}): Promise<ActionResult<UserProfile>> {  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'User not authenticated' }
    }

    const updatedProfile = await updateUserProfile(session.user.id, data)
    
    // Don't revalidate immediately to prevent state loss in client components
    // The client component will handle optimistic updates
    
    return { success: true, data: updatedProfile }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    }
  }
}

/**
 * Update user settings
 */
export async function updateUserSettingsAction(data: {
  notificationsEnabled: boolean
  aiSuggestionsEnabled: boolean
  timezone: string
}): Promise<ActionResult<userSettingsData>> {try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'User not authenticated' }
    }

    const updatedSettings = await updateuserSettings(session.user.id, data)
    
    // Don't revalidate immediately to prevent state loss in client components
    // The client component will handle optimistic updates
    
    return { success: true, data: updatedSettings }
  } catch (error) {
    console.error('Error updating user settings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update settings' 
    }
  }
}

/**
 * Get user profile and settings data
 */
export async function getUserData(): Promise<ActionResult<{
  profile: UserProfile
  settings: userSettingsData
}>> {try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'User not authenticated' }
    }    const [profile, settings] = await Promise.all([
      getUserProfile(session.user.id),
      getuserSettings(session.user.id)
    ])

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    // Use default settings if none exist
    const userSettings = settings || {
      timezone: 'UTC',
      notificationsEnabled: true,
      aiSuggestionsEnabled: true,
      reminderTime: 30
    }

    return { 
      success: true, 
      data: { 
        profile, 
        settings: userSettings 
      } 
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user data' 
    }
  }
}
