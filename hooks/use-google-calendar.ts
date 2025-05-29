"use client"

import { useState, useEffect, useCallback } from 'react'
import { GoogleCalendarEvent } from '@/services/googleIntegrationService'

interface UseGoogleCalendarReturn {
  isConnected: boolean
  events: GoogleCalendarEvent[]
  calendars: any[]
  loading: boolean
  error: string | null
  checkConnection: () => Promise<void>
  fetchEvents: (options?: {
    maxResults?: number
    timeMin?: Date
    timeMax?: Date
    calendarId?: string
  }) => Promise<void>
  connectCalendar: () => Promise<void>
  disconnectCalendar: () => Promise<void>
  createEvent: (event: Partial<GoogleCalendarEvent>, calendarId?: string) => Promise<GoogleCalendarEvent>
  updateEvent: (eventId: string, event: Partial<GoogleCalendarEvent>, calendarId?: string) => Promise<GoogleCalendarEvent>
  deleteEvent: (eventId: string, calendarId?: string) => Promise<void>
  fetchCalendars: () => Promise<void>
}

export function useGoogleCalendar(): UseGoogleCalendarReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([])
  const [calendars, setCalendars] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/integrations/google/status')
      const data = await response.json()
      
      if (response.ok) {
        setIsConnected(data.connected)
      } else {
        setError(data.error)
        setIsConnected(false)
      }
    } catch (err) {
      console.error('Error checking Google Calendar connection:', err)
      setIsConnected(false)
      setError('Failed to check connection status')
    }
  }, [])
  const fetchEvents = useCallback(async (options: {
    maxResults?: number
    timeMin?: Date
    timeMax?: Date
    calendarId?: string
  } = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        maxResults: (options.maxResults || 50).toString(),
        ...(options.timeMin && { timeMin: options.timeMin.toISOString() }),
        ...(options.timeMax && { timeMax: options.timeMax.toISOString() }),
        ...(options.calendarId && { calendarId: options.calendarId }),
      })
      
      const response = await fetch(`/api/integrations/google/events?${params}`)
      
      if (response.status === 401) {
        setIsConnected(false)
        setError('Google Calendar not connected')
        return
      }
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch events')
      }
      
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [])

  const connectCalendar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get authorization URL
      const response = await fetch('/api/integrations/google/auth')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authorization URL')
      }
      
      if (data.authUrl) {
        // Open popup window for OAuth
        const popup = window.open(
          data.authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )
        
        return new Promise<void>((resolve, reject) => {
          // Listen for the OAuth callback
          const messageListener = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return
            
            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
              const { code } = event.data
              
              try {                // Exchange code for tokens
                const callbackResponse = await fetch('/api/integrations/google/callback', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ code })
                })
                
                const callbackData = await callbackResponse.json()
                
                if (callbackData.success) {
                  setIsConnected(true)
                  await fetchEvents()
                  resolve()
                } else {
                  reject(new Error(callbackData.error || 'Failed to connect Google Calendar'))
                }
              } catch (err) {
                reject(err)
              }
              
              popup?.close()
              window.removeEventListener('message', messageListener)
            } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
              reject(new Error(event.data.error || 'Authentication failed'))
              popup?.close()
              window.removeEventListener('message', messageListener)
            }
          }
          
          window.addEventListener('message', messageListener)
          
          // Check if popup was closed without completing auth
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed)
              window.removeEventListener('message', messageListener)
              reject(new Error('Authentication cancelled'))
            }
          }, 1000)
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Google Calendar')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  const disconnectCalendar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
        const response = await fetch('/api/integrations/google/status', {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsConnected(false)
        setEvents([])
        setCalendars([])
      } else {
        throw new Error(data.error || 'Failed to disconnect Google Calendar')
      }
    } catch (err) {      setError(err instanceof Error ? err.message : 'Failed to disconnect Google Calendar')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = useCallback(async (
    event: Partial<GoogleCalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> => {
    try {
      setLoading(true)
      setError(null)
        const response = await fetch('/api/integrations/google/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, calendarId }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Refresh events list
        await fetchEvents()
        return data.event      } else {
        throw new Error(data.error || 'Failed to create event')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  const updateEvent = useCallback(async (
    eventId: string,
    event: Partial<GoogleCalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> => {
    try {
      setLoading(true)
      setError(null)
        const response = await fetch(`/api/integrations/google/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, calendarId }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Refresh events list
        await fetchEvents()
        return data.event      } else {
        throw new Error(data.error || 'Failed to update event')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  const deleteEvent = useCallback(async (
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
        const response = await fetch(
        `/api/integrations/google/events/${eventId}?calendarId=${calendarId}`,
        { method: 'DELETE' }
      )
      
      const data = await response.json()
      
      if (response.ok) {
        // Refresh events list
        await fetchEvents()
      } else {
        throw new Error(data.error || 'Failed to delete event')
      }    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  const fetchCalendars = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/integrations/google/calendars')
      const data = await response.json()
      
      if (response.ok) {
        setCalendars(data.calendars || [])
      } else {
        throw new Error(data.error || 'Failed to fetch calendars')
      }    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendars')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return {
    isConnected,
    events,
    calendars,
    loading,
    error,
    checkConnection,
    fetchEvents,
    connectCalendar,
    disconnectCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchCalendars
  }
}
