import { EventService } from "@/services/eventService"
import { GoogleIntegrationService } from "@/services/googleIntegrationService"
import { CalendarClientPage } from "@/components/calendar/calendar-client-page"

interface CalendarDataProviderProps {
  userId: number
}

export async function CalendarDataProvider({ userId }: CalendarDataProviderProps) {
  // Fetch user's events from the database
  const userEvents = await EventService.getEvents(userId)

  // Fetch Google Calendar events if connected
  let googleEvents: any[] = []
  try {
    const integration = await GoogleIntegrationService.getUserIntegration(userId)
    if (integration) {
      // Get events for the next 30 days
      const timeMin = new Date()
      const timeMax = new Date()
      timeMax.setDate(timeMax.getDate() + 30)
      
      const googleCalendarEvents = await GoogleIntegrationService.getCalendarEvents(userId, {
        timeMin,
        timeMax,
        maxResults: 100
      })
      
      // Format Google Calendar events for the calendar component
      googleEvents = googleCalendarEvents.map((event) => ({
        id: `google-${event.id}`,
        title: event.summary || 'Untitled Event',
        startTime: event.start?.dateTime || event.start?.date || new Date().toISOString(),
        endTime: event.end?.dateTime || event.end?.date || new Date().toISOString(),
        isAllDay: !!event.start?.date, // All-day events use 'date' instead of 'dateTime'
        description: event.description || null,
        location: event.location || null,
        source: 'google' // Add source identifier
      }))
    }
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error)
    // Continue without Google events if there's an error
  }

  // Format local events for the calendar component
  const formattedLocalEvents = userEvents.map((event) => ({
    id: String(event.id),
    title: event.title,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    isAllDay: event.isAllDay ?? false,
    description: event.description,
    location: event.location,
    source: 'local' // Add source identifier
  }))

  // Combine both local and Google events
  const allEvents = [...formattedLocalEvents, ...googleEvents]

  return <CalendarClientPage events={allEvents} />
}
