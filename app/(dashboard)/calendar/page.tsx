import { getUserFromCookie } from "@/lib/auth"
import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { CalendarClientPage } from "@/components/calendar/calendar-client-page"

export default async function CalendarPage() {
  const user = await getUserFromCookie()

  if (!user) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendar</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view your calendar.</p>
        </div>
      </div>
    )
  }

  // Fetch user's events from the database
  const userEvents = await db.query.events.findMany({
    where: eq(events.userId, user.id),
    orderBy: (events, { asc }) => [asc(events.startTime)],
  })

  // Format events for the calendar component
  const formattedEvents = userEvents.map((event) => ({
    id: String(event.id),
    title: event.title,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    isAllDay: event.isAllDay ?? false,
    description: event.description,
    location: event.location,
  }))

  return <CalendarClientPage events={formattedEvents} />
}
