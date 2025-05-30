import { EventService } from "@/services/eventService"
import { GoogleIntegrationService } from "@/services/googleIntegrationService"
import { CalendarClientPage } from "@/components/calendar/calendar-client-page"

interface CalendarDataProviderProps {
  userId: number
}

export async function CalendarDataProvider({ userId }: CalendarDataProviderProps) {
  // Fetch user's events from the database
  const userEvents = await EventService.getAllEvents(userId)
  

  // Format local events for the calendar component
  const formattedLocalEvents = userEvents.map((event) => ({
    id: String(event.id),
    title: event.title,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    isAllDay: event.isAllDay ?? false,
    description: event.description,
    location: event.location,
    source: event.origin  // Add source identifier with proper typing
  }))

  // Combine both local and Google events
  const allEvents = [...formattedLocalEvents]

  return <CalendarClientPage events={allEvents} />
}
