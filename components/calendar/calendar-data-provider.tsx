import { EventService } from "@/services/eventService"
import { CalendarClientPage } from "@/components/calendar/calendar-client-page"
import { getuserSettings } from "@/services/profileService"

interface CalendarDataProviderProps {
  userId: string
}

export async function CalendarDataProvider({ userId }: CalendarDataProviderProps) {
  // Fetch user's events from the database
  const userEvents = await EventService.getAllEvents(userId)
  const userSettings = await getuserSettings(userId);

  return <CalendarClientPage events={userEvents} timezone={userSettings?.timezone ? userSettings?.timezone : undefined} />
  
}
