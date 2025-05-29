import { getUserFromCookie } from "@/lib/auth"
import { EventService } from "@/services/eventService"
import { CalendarView } from "@/components/calendar/calendar-view"
import { Skeleton } from "@/components/ui/skeleton"

export async function UpcomingEvents() {
  const user = await getUserFromCookie()

  if (!user) {
    return null
  }

  // Get upcoming events - this is the slow operation
  const upcomingEvents = await EventService.getAllUpcomingEvents(user.id, 5)

  // Format events for the calendar component
  const formattedEvents = upcomingEvents.map((event) => ({
    id: event.id.toString(),
    title: event.title,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    isAllDay: event.isAllDay ?? false,
  }))

  return <CalendarView events={formattedEvents} view="agenda" />
}


export function UpcomingEventsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}
