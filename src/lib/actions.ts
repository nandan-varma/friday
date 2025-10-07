'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { EventService, UnifiedEvent } from '@/lib/eventService'
import { getUserProfile, updateUserProfile } from '@/lib/profileService'
import { getUserSettings, updateUserSettings } from '@/lib/profileService'
import { GoogleIntegrationService } from '@/lib/googleIntegrationService'
import { auth } from '@/lib/auth'
import { validateEventData, validateEventUpdate, validateProfileUpdate, validateSettingsUpdate, handleValidationError, sanitizeString } from '@/lib/validation'

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

        // Extract and sanitize form data
        const title = formData.get('title')
        const description = formData.get('description')
        const location = formData.get('location')
        const startTime = formData.get('startTime')
        const endTime = formData.get('endTime')
        const isAllDay = formData.get('isAllDay')
        const recurrence = formData.get('recurrence')

        if (!title || typeof title !== 'string') {
           throw new Error('Title is required')
        }
        if (!startTime || typeof startTime !== 'string') {
           throw new Error('Start time is required')
        }
        if (!endTime || typeof endTime !== 'string') {
           throw new Error('End time is required')
        }

        const rawData = {
           title: sanitizeString(title),
           description: description && typeof description === 'string' ? description : undefined,
           location: location && typeof location === 'string' ? location : undefined,
           startTime,
           endTime,
           isAllDay: isAllDay === 'true',
           recurrence: (recurrence && typeof recurrence === 'string') ? recurrence : 'none'
        }

       // Validate the data
       const validation = validateEventData(rawData)
       if (!validation.success) {
          throw handleValidationError(validation.error)
       }

       await EventService.saveEvent(session.user.id, validation.data)

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

       const eventIdRaw = formData.get('eventId')
       const titleRaw = formData.get('title')
       const description = formData.get('description')
       const location = formData.get('location')
       const startTimeStrRaw = formData.get('startTime')
       const endTimeStrRaw = formData.get('endTime')
       const isAllDay = formData.get('isAllDay') === 'true'
       const recurrenceRaw = formData.get('recurrence')

       if (!eventIdRaw || typeof eventIdRaw !== 'string') {
          throw new Error('Event ID is required')
       }
       if (!titleRaw || typeof titleRaw !== 'string') {
          throw new Error('Title is required')
       }
       if (!startTimeStrRaw || typeof startTimeStrRaw !== 'string') {
          throw new Error('Start time is required')
       }
       if (!endTimeStrRaw || typeof endTimeStrRaw !== 'string') {
          throw new Error('End time is required')
       }

       const eventId = eventIdRaw as string
       const title = titleRaw as string
       const startTimeStr = startTimeStrRaw as string
       const endTimeStr = endTimeStrRaw as string
       const recurrence = (recurrenceRaw && typeof recurrenceRaw === 'string' &&
                          ['none', 'daily', 'weekly', 'monthly', 'yearly'].includes(recurrenceRaw))
                         ? recurrenceRaw as "none" | "daily" | "weekly" | "monthly" | "yearly"
                         : 'none'

       // Additional validation
       if (!(eventIdRaw as string).trim()) {
          throw new Error('Event ID is required')
       }
       if (!(titleRaw as string).trim()) {
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
          description: (description as string)?.trim() || null,
          location: (location as string)?.trim() || null,
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

     const eventIdRaw = formData.get('eventId')

     if (!eventIdRaw || typeof eventIdRaw !== 'string') {
       throw new Error('Event ID is required')
     }

     await EventService.deleteEvent(session.user.id, eventIdRaw)

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

       const nameRaw = formData.get('name')
       const emailRaw = formData.get('email')

       const name = nameRaw && typeof nameRaw === 'string' ? nameRaw : undefined
       const email = emailRaw && typeof emailRaw === 'string' ? emailRaw : undefined

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

       const timezoneRaw = formData.get('timezone')
       const notificationsEnabled = formData.get('notificationsEnabled') === 'true'
       const aiSuggestionsEnabled = formData.get('aiSuggestionsEnabled') === 'true'
       const reminderTimeStrRaw = formData.get('reminderTime')

       const timezone = timezoneRaw && typeof timezoneRaw === 'string' ? timezoneRaw : undefined
       const reminderTimeStr = reminderTimeStrRaw && typeof reminderTimeStrRaw === 'string' ? reminderTimeStrRaw : undefined

       // Validation
       if (reminderTimeStr && (isNaN(parseInt(reminderTimeStr)) || parseInt(reminderTimeStr) < 0)) {
          throw new Error('Reminder time must be a non-negative number')
       }

       const reminderTime = reminderTimeStr ? parseInt(reminderTimeStr) : undefined

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

  const { url: authUrl, state } = await GoogleIntegrationService.getAuthUrl()
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

// Auth Actions
export async function logout() {
  'use server'

  try {
    await auth.api.signOut({
      headers: await import('next/headers').then(m => m.headers())
    })
  } catch (error) {
    console.error('Error during logout:', error)
    throw new Error('Failed to logout')
  }
}