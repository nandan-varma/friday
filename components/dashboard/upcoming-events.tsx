import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { EventService } from "@/services/eventService"
import { UpcomingEventsClient } from "./upcoming-events-client"

export async function UpcomingEvents() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return null
  }

  // Fetch data directly in server component
  const upcomingEvents = await EventService.getAllUpcomingEvents(session.user.id, 5)

  return <UpcomingEventsClient initialEvents={upcomingEvents} userId={session.user.id} />
}

export function UpcomingEventsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}