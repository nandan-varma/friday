'use server'

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { EventService, type UnifiedEvent } from "@/services/eventService"
import { type CreateEventData, type UpdateEventData } from "@/services/localIntegrationService"

export type ActionResult<T = any> = 
    | { success: true; data: T }
    | { success: false; error: string }

/**
 * Save an event (create or update)
 */
export async function saveEvent(
    eventData: CreateEventData,
    options?: {
        eventId?: string
        preferredOrigin?: "local" | "google"
        calendarId?: string
    }
): Promise<ActionResult<{ event: UnifiedEvent }>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        const savedEvent = await EventService.saveEvent(session.user.id, eventData, options)

        // Revalidate calendar-related pages
        revalidatePath('/calendar')
        revalidatePath('/dashboard/calendar')

        return { success: true, data: { event: savedEvent } }
    } catch (error) {
        console.error('Error saving event:', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to save event' 
        }
    }
}

/**
 * Delete an event
 */
export async function deleteEvent(
    eventId: string,
    calendarId?: string
): Promise<ActionResult> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        await EventService.deleteEvent(session.user.id, eventId, calendarId)

        // Revalidate calendar-related pages
        revalidatePath('/calendar')
        revalidatePath('/dashboard/calendar')

        return { success: true }
    } catch (error) {
        console.error('Error deleting event:', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete event' 
        }
    }
}
