import { EventService } from "@/services/eventService"
import { CalendarClientPage } from "@/components/calendar/calendar-client-page"

interface CalendarDataProviderProps {
  userId: number
}

export async function CalendarDataProvider({ userId }: CalendarDataProviderProps) {
  // Fetch user's events from the database
  const userEvents = await EventService.getAllEvents(userId)
  
  // Format local events for the calendar component
  const formattedEvents = userEvents.map((event) => ({
    id: String(event.id),
    title: event.title,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    isAllDay: event.isAllDay ?? false,
    description: event.description,
    location: event.location,
    source: event.origin  // Add source identifier with proper typing
  }))

  return <CalendarClientPage events={formattedEvents} />
}
