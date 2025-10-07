'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { EventService, UnifiedEvent } from '@/lib/eventService'
import { getUserProfile, updateUserProfile } from '@/lib/profileService'
import { getUserSettings, updateUserSettings } from '@/lib/profileService'
import { GoogleIntegrationService } from '@/lib/googleIntegrationService'
import { auth } from '@/lib/auth'

// Event Actions
export async function createEvent(formData: FormData) {
   'use server'

   try {
      // Get the current user session
      const session = await auth.api.getSession({
         headers: await import('next/headers').then(m => m.headers())
      })

      if (!session?.user) {
         throw new Error('Unauthorized')
      }

      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const location = formData.get('location') as string
      const startTimeStr = formData.get('startTime') as string
      const endTimeStr = formData.get('endTime') as string
      const isAllDay = formData.get('isAllDay') === 'true'
      const recurrenceInput = formData.get('recurrence') as string

      // Validate recurrence
      const validRecurrences = ["none", "daily", "weekly", "monthly", "yearly"] as const
      if (recurrenceInput && !validRecurrences.includes(recurrenceInput as any)) {
         throw new Error('Invalid recurrence value')
      }
      const recurrence = recurrenceInput as "none" | "daily" | "weekly" | "monthly" | "yearly" | undefined

      // Validation
      if (!title?.trim()) {
         throw new Error('Title is required')
      }
      if (!startTimeStr) {
         throw new Error('Start time is required')
      }
      if (!endTimeStr) {
         throw new Error('End time is required')
      }

      const startTime = new Date(startTimeStr)
      const endTime = new Date(endTimeStr)

      if (isNaN(startTime.getTime())) {
         throw new Error('Invalid start time')
      }
      if (isNaN(endTime.getTime())) {
         throw new Error('Invalid end time')
      }
      if (startTime >= endTime) {
         throw new Error('End time must be after start time')
      }

      const eventData = {
         title: title.trim(),
         description: description?.trim() || null,
         location: location?.trim() || null,
         startTime,
         endTime,
         isAllDay,
         recurrence
      }

      await EventService.saveEvent(session.user.id, eventData)

      revalidatePath('/dashboard')
   } catch (error) {
      console.error('Error creating event:', error)
      throw error instanceof Error ? error : new Error('Failed to create event')
   }
}

export async function updateEvent(formData: FormData) {
   'use server'

   try {
      // Get the current user session
      const session = await auth.api.getSession({
         headers: await import('next/headers').then(m => m.headers())
      })

      if (!session?.user) {
         throw new Error('Unauthorized')
      }

      const eventId = formData.get('eventId') as string
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const location = formData.get('location') as string
      const startTimeStr = formData.get('startTime') as string
      const endTimeStr = formData.get('endTime') as string
      const isAllDay = formData.get('isAllDay') === 'true'
      const recurrence = formData.get('recurrence') as "none" | "daily" | "weekly" | "monthly" | "yearly"

      // Validation
      if (!eventId?.trim()) {
         throw new Error('Event ID is required')
      }
      if (!title?.trim()) {
         throw new Error('Title is required')
      }
      if (!startTimeStr) {
         throw new Error('Start time is required')
      }
      if (!endTimeStr) {
         throw new Error('End time is required')
      }

      const startTime = new Date(startTimeStr)
      const endTime = new Date(endTimeStr)

      if (isNaN(startTime.getTime())) {
         throw new Error('Invalid start time')
      }
      if (isNaN(endTime.getTime())) {
         throw new Error('Invalid end time')
      }
      if (startTime >= endTime) {
         throw new Error('End time must be after start time')
      }

      const eventData = {
         title: title.trim(),
         description: description?.trim() || null,
         location: location?.trim() || null,
         startTime,
         endTime,
         isAllDay,
         recurrence
      }

      await EventService.saveEvent(session.user.id, eventData, { eventId })

      revalidatePath('/dashboard')
   } catch (error) {
      console.error('Error updating event:', error)
      throw error instanceof Error ? error : new Error('Failed to update event')
   }
}

export async function deleteEvent(formData: FormData) {
  'use server'

  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(m => m.headers())
    })

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const eventId = formData.get('eventId') as string

    await EventService.deleteEvent(session.user.id, eventId)

    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new Error('Failed to delete event')
  }
}

// Profile Actions
export async function updateProfile(formData: FormData) {
   'use server'

   try {
      // Get the current user session
      const session = await auth.api.getSession({
         headers: await import('next/headers').then(m => m.headers())
      })

      if (!session?.user) {
         throw new Error('Unauthorized')
      }

      const name = formData.get('name') as string
      const email = formData.get('email') as string

      // Validation
      if (name && name.trim().length < 2) {
         throw new Error('Name must be at least 2 characters long')
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         throw new Error('Invalid email format')
      }

      await updateUserProfile(session.user.id, {
         name: name?.trim() || undefined,
         email: email?.trim() || undefined
      })

      revalidatePath('/dashboard')
   } catch (error) {
      console.error('Error updating profile:', error)
      throw error instanceof Error ? error : new Error('Failed to update profile')
   }
}

// Settings Actions
export async function updateSettings(formData: FormData) {
   'use server'

   try {
      // Get the current user session
      const session = await auth.api.getSession({
         headers: await import('next/headers').then(m => m.headers())
      })

      if (!session?.user) {
         throw new Error('Unauthorized')
      }

      const timezone = formData.get('timezone') as string
      const notificationsEnabled = formData.get('notificationsEnabled') === 'true'
      const aiSuggestionsEnabled = formData.get('aiSuggestionsEnabled') === 'true'
      const reminderTimeStr = formData.get('reminderTime') as string

      // Validation
      if (reminderTimeStr && (isNaN(parseInt(reminderTimeStr)) || parseInt(reminderTimeStr) < 0)) {
         throw new Error('Reminder time must be a non-negative number')
      }

      const reminderTime = parseInt(reminderTimeStr)

      await updateUserSettings(session.user.id, {
         timezone: timezone?.trim(),
         notificationsEnabled,
         aiSuggestionsEnabled,
         reminderTime
      })

      revalidatePath('/dashboard')
   } catch (error) {
      console.error('Error updating settings:', error)
      throw error instanceof Error ? error : new Error('Failed to update settings')
   }
}

// Data fetching actions
export async function getProfileData() {
  'use server'

  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(m => m.headers())
    })

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const profile = await getUserProfile(session.user.id)
    const settings = await getUserSettings(session.user.id)
    const googleIntegration = await GoogleIntegrationService.getUserIntegration(session.user.id)

    return { profile, settings, googleIntegration }
  } catch (error) {
    console.error('Error fetching profile data:', error)
    throw new Error('Failed to fetch profile data')
  }
}

export async function getUserProfileData() {
  'use server'

  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(m => m.headers())
    })

    if (!session?.user) {
      return null
    }

    return await getUserProfile(session.user.id)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function getUserSettingsData() {
  'use server'

  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(m => m.headers())
    })

    if (!session?.user) {
      return null
    }

    return await getUserSettings(session.user.id)
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return null
  }
}

export async function getGoogleIntegration() {
  'use server'

  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(m => m.headers())
    })

    if (!session?.user) {
      return null
    }

    return await GoogleIntegrationService.getUserIntegration(session.user.id)
  } catch (error) {
    console.error('Error fetching Google integration:', error)
    return null
  }
}

// Google Integration Actions
export async function connectGoogleCalendar() {
  'use server'

  const authUrl = await GoogleIntegrationService.getAuthUrl()
  redirect(authUrl)
}

export async function disconnectGoogleCalendar() {
  'use server'

  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(m => m.headers())
    })

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    await GoogleIntegrationService.disconnectIntegration(session.user.id)
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error)
    throw new Error('Failed to disconnect Google Calendar')
  }
}