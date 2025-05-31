'use server'

import { GoogleIntegrationService } from '@/services/googleIntegrationService'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface ActionResult<T = any> {
    success: boolean
    data?: T
    error?: string
}

/**
 * Get Google Calendar authorization URL
 */
export async function getGoogleAuthUrl(): Promise<ActionResult<{ authUrl: string }>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        const authUrl = GoogleIntegrationService.getAuthUrl()
        return { success: true, data: { authUrl } }
    } catch (error) {
        console.error('Error generating auth URL:', error)
        return { success: false, error: 'Failed to generate authorization URL' }
    }
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGoogleAuthCode(code: string): Promise<ActionResult> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        await GoogleIntegrationService.exchangeCodeForTokens(code, session.user.id)

        // Revalidate the integrations page
        revalidatePath('/dashboard/integrations')

        return { success: true }
    } catch (error) {
        console.error('Error exchanging code for tokens:', error)
        return { success: false, error: 'Failed to connect Google Calendar' }
    }
}

/**
 * Check Google Calendar connection status
 */
export async function checkGoogleConnection(): Promise<ActionResult<{
    connected: boolean
    integration?: {
        id: number
        expiresAt: Date | null
        hasRefreshToken: boolean
    }
}>> {    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        const connected = await GoogleIntegrationService.hasValidIntegration(session.user.id)
        const integration = await GoogleIntegrationService.getUserIntegration(session.user.id)

        return {
            success: true,
            data: {
                connected,
                integration: integration ? {
                    id: integration.id,
                    expiresAt: integration.expiresAt,
                    hasRefreshToken: !!integration.refreshToken
                } : undefined
            }
        }
    } catch (error) {
        console.error('Error checking Google Calendar connection:', error)
        return { success: false, error: 'Failed to check connection status' }
    }
}

/**
 * Disconnect Google Calendar integration
 */
export async function disconnectGoogleCalendar(): Promise<ActionResult> {    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        await GoogleIntegrationService.disconnectIntegration(session.user.id)

        // Revalidate the integrations page
        revalidatePath('/dashboard/integrations')

        return { success: true }
    } catch (error) {
        console.error('Error disconnecting Google Calendar:', error)
        return { success: false, error: 'Failed to disconnect Google Calendar' }
    }
}

/**
 * Get user's Google Calendar list
 */
export async function getGoogleCalendars(): Promise<ActionResult<{ calendars: any[] }>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        const calendars = await GoogleIntegrationService.getCalendarList(session.user.id)
        return { success: true, data: { calendars } }
    } catch (error) {
        console.error('Error fetching calendars:', error)
        return { success: false, error: 'Failed to fetch calendars' }
    }
}

/**
 * Get Google Calendar events
 */
export async function getGoogleCalendarEvents(options: {
    maxResults?: number
    timeMin?: Date
    timeMax?: Date
    calendarId?: string
} = {}): Promise<ActionResult<{ events: any[] }>> {    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        const events = await GoogleIntegrationService.getCalendarEvents(session.user.id, options)
        return { success: true, data: { events } }
    } catch (error) {
        console.error('Error fetching calendar events:', error)
        return { success: false, error: 'Failed to fetch calendar events' }
    }
}

/**
 * Create a new Google Calendar event
 */
export async function createGoogleCalendarEvent(
    event: any,
    calendarId: string = 'primary'
): Promise<ActionResult<{ event: any }>> {    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        const createdEvent = await GoogleIntegrationService.createCalendarEvent(session.user.id, event, calendarId)

        // Revalidate calendar-related pages
        revalidatePath('/dashboard/calendar')
        revalidatePath('/dashboard/integrations')

        return { success: true, data: { event: createdEvent } }
    } catch (error) {
        console.error('Error creating calendar event:', error)
        return { success: false, error: 'Failed to create calendar event' }
    }
}

/**
 * Update an existing Google Calendar event
 */
export async function updateGoogleCalendarEvent(
    eventId: string,
    event: any,
    calendarId: string = 'primary'
): Promise<ActionResult<{ event: any }>> {    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        const updatedEvent = await GoogleIntegrationService.updateCalendarEvent(session.user.id, eventId, event, calendarId)

        // Revalidate calendar-related pages
        revalidatePath('/dashboard/calendar')
        revalidatePath('/dashboard/integrations')

        return { success: true, data: { event: updatedEvent } }
    } catch (error) {
        console.error('Error updating calendar event:', error)
        return { success: false, error: 'Failed to update calendar event' }
    }
}

/**
 * Delete a Google Calendar event
 */
export async function deleteGoogleCalendarEvent(
    eventId: string,
    calendarId: string = 'primary'
): Promise<ActionResult> {    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            return { success: false, error: 'User not authenticated' }
        }

        await GoogleIntegrationService.deleteCalendarEvent(session.user.id, eventId, calendarId)

        // Revalidate calendar-related pages
        revalidatePath('/dashboard/calendar')
        revalidatePath('/dashboard/integrations')

        return { success: true }
    } catch (error) {
        console.error('Error deleting calendar event:', error)
        return { success: false, error: 'Failed to delete calendar event' }
    }
}

/**
 * Refresh integrations page data
 */
export async function refreshIntegrationsPage(): Promise<ActionResult> {
    try {
        revalidatePath('/dashboard/integrations')
        return { success: true }
    } catch (error) {
        console.error('Error refreshing integrations page:', error)
        return { success: false, error: 'Failed to refresh page' }
    }
}
