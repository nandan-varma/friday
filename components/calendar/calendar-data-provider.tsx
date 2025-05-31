import { EventService } from "@/services/eventService"
import { CalendarClientPage } from "@/components/calendar/calendar-client-page"

interface CalendarDataProviderProps {
  userId: number
}

export async function CalendarDataProvider({ userId }: CalendarDataProviderProps) {
  // Fetch user's events from the database
  const userEvents = await EventService.getAllEvents(userId)

  return <CalendarClientPage events={userEvents} />
}
