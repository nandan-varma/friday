"use client"

import { useState, useEffect, useCallback } from 'react'

interface GoogleCalendarEvent {
  id?: string
  summary?: string
  description?: string
  start?: {
    dateTime?: string
    date?: string
  }
  end?: {
    dateTime?: string
    date?: string
  }
  location?: string
  attendees?: Array<{
    email?: string
    displayName?: string
    responseStatus?: string
  }>
}

interface UseGoogleCalendarReturn {
  isConnected: boolean
  events: GoogleCalendarEvent[]
  loading: boolean
  error: string | null
  checkConnection: () => Promise<void>
  fetchEvents: (maxResults?: number) => Promise<void>
  connectCalendar: () => Promise<void>
}

export function useGoogleCalendar(): UseGoogleCalendarReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/integrations/google/status')
      const data = await response.json()
      setIsConnected(data.connected)
    } catch (err) {
      console.error('Error checking Google Calendar connection:', err)
      setIsConnected(false)
    }
  }, [])

  const fetchEvents = useCallback(async (maxResults: number = 10) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/integrations/google/events?maxResults=${maxResults}`)
      
      if (response.status === 401) {
        setIsConnected(false)
        setError('Google Calendar not connected')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
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
      
      // Get authorization URL
      const response = await fetch('/api/integrations/google/auth')
      const data = await response.json()
      
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
              
              try {
                // Exchange code for tokens
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
                  reject(new Error('Failed to connect Google Calendar'))
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

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return {
    isConnected,
    events,
    loading,
    error,
    checkConnection,
    fetchEvents,
    connectCalendar
  }
}
