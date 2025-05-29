"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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

export function GoogleCalendarEvents() {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/integrations/google/events?maxResults=5')
      
      if (response.status === 401) {
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
  }

  const formatEventTime = (event: GoogleCalendarEvent) => {
    if (!event.start) return 'No time specified'
    
    const startTime = event.start.dateTime || event.start.date
    if (!startTime) return 'No time specified'
    
    const date = new Date(startTime)
    
    if (event.start.date) {
      // All-day event
      return date.toLocaleDateString()
    } else {
      // Timed event
      return date.toLocaleString()
    }
  }
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Events
          </CardTitle>
          <CardDescription>Your upcoming events from Google Calendar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Events
          </CardTitle>
          <CardDescription>Your upcoming events from Google Calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground break-words">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 w-full sm:w-auto"
              onClick={() => window.location.href = '/dashboard/integrations'}
            >
              Connect Google Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Events
        </CardTitle>
        <CardDescription>Your upcoming events from Google Calendar</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No upcoming events found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id || index} className="border rounded-lg p-4 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-medium break-words">{event.summary || 'Untitled Event'}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="break-words">{formatEventTime(event)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">{event.location}</span>
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  {event.start?.date && (
                    <Badge variant="outline" className="flex-shrink-0">All Day</Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 break-words">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/dashboard/calendar'}
            >
              View All Events
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
